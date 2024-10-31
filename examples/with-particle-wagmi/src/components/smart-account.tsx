import { ReactNode } from 'react';
import { SmartAccountProvider as Provider, useSmartAccount } from '@bitlayer/aa-sdk';
import { useAccount, useWalletClient } from 'wagmi';
import { SmartAccountContext } from '@/hooks/smart-account';

function InnerProvider({ children }: { children?: ReactNode }) {
  const { chain } = useAccount();
  const { data: walletClient } = useWalletClient();
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
