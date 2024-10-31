import { http } from 'viem';
import { split } from '@aa-sdk/core';

export interface BitlayerTransport {
  bundler?: string;
  paymaster?: string;
}

export function bitlayer({ bundler, paymaster }: BitlayerTransport) {
  return split({
    overrides: [
      {
        methods: [
          'eth_sendUserOperation',
          'eth_estimateUserOperationGas',
          'eth_getUserOperationReceipt',
          'eth_getUserOperationByHash',
          'eth_supportedEntryPoints',
        ],
        transport: http(bundler),
      },
      {
        methods: ['pm_supported_tokens', 'pm_sponsor_userop', 'pm_entrypoints'],
        transport: http(paymaster),
      },
    ],
    fallback: http(),
  });
}
