import { createContext } from 'react';
import { SmartAccountConfig } from './client';

export interface SmartAccountContextData {
  config: SmartAccountConfig;
}

export const SmartAccountContext = createContext({} as SmartAccountContextData);
