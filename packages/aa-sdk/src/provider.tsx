import React from 'react';
import { SmartAccountContext } from './context';
import { SmartAccountConfig } from './client';

export function SmartAccountProvider({
  config,
  children,
}: {
  config: SmartAccountConfig;
  children?: React.ReactNode;
}) {
  return <SmartAccountContext.Provider value={{ config }}>{children}</SmartAccountContext.Provider>;
}
