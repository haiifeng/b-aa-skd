import { useCallback, useContext, useEffect, useState } from 'react';
import { Chain, Transport, WalletClient } from 'viem';
import { SmartContractAccount } from '@aa-sdk/core';
import { createSmartAccountClient, SmartAccountClient } from './client';
import { SmartAccountContext } from './context';

export interface UseSmartAccountParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
> {
  chain?: TChain;
  walletClient?: WalletClient<TTransport, TChain>;
}

export interface UseSmartAccountReturnValue<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TClient extends SmartAccountClient = SmartAccountClient<TTransport, TChain>,
> {
  client?: TClient;
  account?: SmartContractAccount;
  eoa?: WalletClient<TTransport, TChain>;
  isLoading: boolean;
}

export function useSmartAccount<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(
  params: UseSmartAccountParams<TTransport, TChain> = {},
): UseSmartAccountReturnValue<TTransport, TChain> {
  const { config } = useContext(SmartAccountContext);
  const { chain, walletClient } = params;

  const [smartAccountClient, setSmartAccountClient] = useState<
    SmartAccountClient<TTransport, TChain> | undefined
  >();
  const [smartAccount, setSmartAccount] = useState<SmartContractAccount | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const initSmartAccount = useCallback(
    async (eoa: WalletClient<TTransport, TChain>, chain: TChain) => {
      setIsLoading(true);

      const client = await createSmartAccountClient<TTransport, TChain>({
        eoa,
        chain,
        config,
      });

      setSmartAccountClient(client);
      setSmartAccount(client.account);
      setIsLoading(false);
    },
    [setSmartAccount, setSmartAccountClient, config],
  );

  useEffect(() => {
    if (!walletClient || !chain) {
      return;
    }
    initSmartAccount(walletClient, chain);
  }, [walletClient, chain, initSmartAccount]);

  return {
    client: smartAccountClient,
    account: smartAccount,
    eoa: walletClient,
    isLoading,
  };
}
