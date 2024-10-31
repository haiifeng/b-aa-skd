import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Address, createWalletClient, custom, Chain, WalletClient } from 'viem';
import { useWallets } from '@privy-io/react-auth';
import { SmartAccountProvider as Provider, useSmartAccount } from '@bitlayer/aa-sdk';
import { SmartAccountContext } from '@/hooks/smart-account';

function usePrivyEmbeddedWalletClient(chain?: Chain) {
  const { wallets } = useWallets();
  const [walletClient, setWalletClient] = useState<WalletClient | undefined>(undefined);

  const initWalletClient = useCallback(async () => {
    const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
    if (!embeddedWallet) {
      setWalletClient(undefined);
      return;
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const walletClient = createWalletClient({
      account: embeddedWallet.address as Address,
      chain,
      transport: custom(provider),
    });
    setWalletClient(walletClient);
  }, [wallets, chain]);

  useEffect(() => {
    initWalletClient();
  }, [wallets, initWalletClient]);

  return walletClient;
}

function InnerProvider({ children }: { children?: ReactNode }) {
  const { chain } = useAccount();
  const walletClient = usePrivyEmbeddedWalletClient(chain);

  const { client, eoa } = useSmartAccount({
    chain,
    walletClient,
  });
  return (
    <SmartAccountContext.Provider value={{ client, eoa }}>{children}</SmartAccountContext.Provider>
  );
}

export function SmartAccountProvider({ children }: { children?: ReactNode }) {
  return (
    <Provider
      config={{
        bundlerUrl: import.meta.env.VITE_4337_BUNDLER_URL,
        paymasterUrl: import.meta.env.VITE_4337_PAYMASTER_URL,
        paymasterAddress: import.meta.env.VITE_4337_PAYMASTER_ADDRESS,
        apiKey: import.meta.env.VITE_4337_PROJECT_APIKEY,
        factoryAddress: import.meta.env.VITE_4337_FACTORY_ADDRESS,
        factoryVersion: import.meta.env.VITE_4337_FACTORY_VERSION,
      }}
    >
      <InnerProvider>{children}</InnerProvider>
    </Provider>
  );
}
