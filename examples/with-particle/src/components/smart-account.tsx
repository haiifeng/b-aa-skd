import { ReactNode, useMemo } from 'react';
import { SmartAccountProvider as Provider, useSmartAccount } from '@bitlayer/aa-sdk';
import { SmartAccountContext } from '@/hooks/smart-account';
import { useEthereum } from '@particle-network/authkit';
import { Address, createWalletClient, custom } from 'viem';

function InnerProvider({ children }: { children?: ReactNode }) {
  const { provider, address, chainInfo: chain } = useEthereum();

  const walletClient = useMemo(() => {
    if (!address || !chain || !provider) return undefined;

    return createWalletClient({
      account: address as Address,
      chain,
      transport: custom(provider),
    });
  }, [chain, provider, address]);

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
