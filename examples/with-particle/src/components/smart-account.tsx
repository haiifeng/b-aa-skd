import { ReactNode, useMemo } from 'react';
import { SmartAccountProvider as Provider, useSmartAccount } from '@bitlayer/aa-sdk';
import { SmartAccountContext } from '@/hooks/smart-account';
import { useAccount, useWallets } from '@particle-network/connectkit';

function InnerProvider({ children }: { children?: ReactNode }) {
  const { chain } = useAccount();
  const [primaryWallet] = useWallets();

  const walletClient = useMemo(() => {
    if (!primaryWallet) {
      return undefined;
    }
    return primaryWallet.getWalletClient();
  }, [primaryWallet]);

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
