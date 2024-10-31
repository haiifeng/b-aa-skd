import {
  Address,
  Chain,
  Client,
  createWalletClient,
  custom,
  getAddress,
  ProviderConnectInfo,
  toHex,
  UserRejectedRequestError,
} from 'viem';
import { createConnector } from 'wagmi';
import { Config as ParticleConfig, LoginOptions, ParticleNetwork } from '@particle-network/auth';
import { ParticleProvider } from '@particle-network/provider';
import { type Connector } from '@wagmi/core';

interface ParticleOptions {
  config: ParticleConfig;
  login?: LoginOptions;
}

particle.type = 'particle' as const;
export function particle(options: ParticleOptions) {
  type Properties = {
    onConnect(connectInfo: ProviderConnectInfo): void;
    switchChain(parameters: { chainId: number }): Promise<Chain>;
  };

  let client_: ParticleNetwork | undefined;
  let provider_: ParticleProvider | undefined;

  let accountsChanged: Connector['onAccountsChanged'] | undefined;
  let chainChanged: Connector['onChainChanged'] | undefined;
  let connect: Connector['onConnect'] | undefined;
  let disconnect: Connector['onDisconnect'] | undefined;

  return createConnector<ParticleProvider, Properties>((config) => ({
    id: 'network.particle',
    name: 'Particle Auth',
    type: particle.type,
    icon: icon,

    async setup() {
      await this.getProvider();
      if (client_ && client_.auth.isLogin()) {
        let chainId = await this.getChainId();
        const chain = config.chains.find((x) => x.id === chainId);
        if (!chain) {
          chainId = config.chains[0].id;
          await this.switchChain({ chainId });
        }
        this.onConnect({ chainId: chainId.toString() });
      }
    },

    async connect(
      parameters?:
        | { chainId?: number | undefined; isReconnecting?: boolean | undefined }
        | undefined,
    ): Promise<{
      accounts: readonly Address[];
      chainId: number;
    }> {
      const { chainId } = parameters ?? {};
      try {
        const provider = await this.getProvider();

        // Switch to chain if provided
        let currentChainId = await this.getChainId();
        if (chainId && currentChainId !== chainId) {
          const chain = await this.switchChain({ chainId }).catch((error) => {
            if (error.code === UserRejectedRequestError.code) throw error;
            return { id: currentChainId };
          });
          currentChainId = chain?.id ?? currentChainId;
        }

        if (!client_?.auth.isLogin()) {
          await client_?.auth.login(options.login);
        }

        const accounts = await this.getAccounts();

        if (connect) {
          provider.removeListener('connect', connect);
          connect = undefined;
        }
        if (!accountsChanged) {
          accountsChanged = this.onAccountsChanged.bind(this);
          provider.on('accountsChanged', accountsChanged);
        }
        if (!chainChanged) {
          chainChanged = this.onChainChanged.bind(this);
          provider.on('chainChanged', chainChanged);
        }
        if (!disconnect) {
          disconnect = this.onDisconnect.bind(this);
          provider.on('disconnect', disconnect);
        }

        return {
          accounts,
          chainId: currentChainId,
        };
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((error as any).code === 4011) throw new UserRejectedRequestError(error as Error);
        throw error;
      }
    },

    async disconnect(): Promise<void> {
      if (!client_) return;

      const provider = await this.getProvider();

      // Manage EIP-1193 event listeners
      if (chainChanged) {
        provider.removeListener('chainChanged', chainChanged);
        chainChanged = undefined;
      }
      if (disconnect) {
        provider.removeListener('disconnect', disconnect);
        disconnect = undefined;
      }
      if (!connect) {
        connect = this.onConnect.bind(this);
        provider.on('connect', connect);
      }

      provider.disconnect();
    },

    async getAccounts(): Promise<readonly Address[]> {
      const provider = await this.getProvider();
      const accounts = await provider.request({
        method: 'eth_accounts',
      });
      return accounts.map(getAddress);
    },

    async getChainId(): Promise<number> {
      const provider = await this.getProvider();
      const chainId = await provider.request({ method: 'eth_chainId' });
      return Number(chainId);
    },

    async getProvider(
      // @ts-expect-error chainId is not used
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      parameters?: { chainId?: number | undefined } | undefined,
    ): Promise<ParticleProvider> {
      if (!provider_) {
        client_ = new ParticleNetwork(options.config);
        provider_ = new ParticleProvider(client_.auth);
      }
      return provider_;
    },

    async getClient(parameters?: { chainId?: number | undefined } | undefined): Promise<Client> {
      const [provider, accounts] = await Promise.all([this.getProvider(), this.getAccounts()]);
      const chain = config.chains.find((x) => x.id === parameters?.chainId);
      if (!provider) throw new Error('provider is required.');

      return createWalletClient({
        account: accounts[0],
        chain,
        transport: custom(provider),
      });
    },

    async switchChain(parameters) {
      const chainId = parameters.chainId;
      const provider = await this.getProvider();

      const id = toHex(chainId);
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: id }],
      });

      return (
        config.chains.find((x) => x.id === chainId) ?? {
          id: chainId,
          name: `Chain ${id}`,
          network: `${id}`,
          nativeCurrency: { name: 'Ether', decimals: 18, symbol: 'ETH' },
          rpcUrls: { default: { http: [''] }, public: { http: [''] } },
        }
      );
    },

    async isAuthorized(): Promise<boolean> {
      try {
        await this.getProvider();
        if (!client_) {
          return false;
        }
        return client_.auth.isLogin() && client_.auth.walletExist();
      } catch {
        return false;
      }
    },

    async onAccountsChanged(accounts: string[]) {
      // Disconnect if there are no accounts
      if (accounts.length === 0) {
        this.onDisconnect();
      }
      // Connect if emitter is listening for connect event (e.g. is disconnected and connects through wallet interface)
      else if (config.emitter.listenerCount('connect')) {
        const chainId = (await this.getChainId()).toString();
        this.onConnect({ chainId });
      }
      // Regular change event
      else
        config.emitter.emit('change', {
          accounts: accounts.map((x) => getAddress(x)),
        });
    },

    onChainChanged(chainId: string): void {
      const id = Number(chainId);
      config.emitter.emit('change', { chainId: id });
    },

    async onConnect(connectInfo) {
      const accounts = await this.getAccounts();
      if (accounts.length === 0) return;

      const chainId = Number(connectInfo.chainId);
      config.emitter.emit('connect', { accounts, chainId });

      const provider = await this.getProvider();
      if (connect) {
        provider.removeListener('connect', connect);
        connect = undefined;
      }
      if (!accountsChanged) {
        accountsChanged = this.onAccountsChanged.bind(this);
        provider.on('accountsChanged', accountsChanged);
      }
      if (!chainChanged) {
        chainChanged = this.onChainChanged.bind(this);
        provider.on('chainChanged', chainChanged);
      }
      if (!disconnect) {
        disconnect = this.onDisconnect.bind(this);
        provider.on('disconnect', disconnect);
      }
    },

    // @ts-expect-error error is not used
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async onDisconnect(error?: Error | undefined) {
      const provider = await this.getProvider();

      config.emitter.emit('disconnect');

      // Manage EIP-1193 event listeners
      if (chainChanged) {
        provider.removeListener('chainChanged', chainChanged);
        chainChanged = undefined;
      }
      if (disconnect) {
        provider.removeListener('disconnect', disconnect);
        disconnect = undefined;
      }
      if (!connect) {
        connect = this.onConnect.bind(this);
        provider.on('connect', connect);
      }
    },
  }));
}

const icon =
  'data:image/png;base64,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';
