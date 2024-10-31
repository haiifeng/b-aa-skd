import { createContext, useContext } from 'react';
import { SmartAccountClient } from '@bitlayer/aa-sdk';
import { WalletClient } from 'viem';

interface ContextData {
  client?: SmartAccountClient;
  eoa?: WalletClient;
}

export const SmartAccountContext = createContext({} as ContextData);

export function useSmartAccount() {
  return useContext(SmartAccountContext);
}
