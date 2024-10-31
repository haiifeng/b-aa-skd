import {
  SmartAccountClient as SmartAccountClientCore,
  SmartAccountClientActions,
  SmartAccountSigner,
  SmartContractAccount,
  WalletClientSigner,
} from '@aa-sdk/core';
import {
  createLightAccountClient,
  LightAccount,
  LightAccountClientActions,
  LightAccountVersion,
} from '@account-kit/smart-contracts';
import { Address, Chain, Transport, WalletClient } from 'viem';
import { createPaymasterActions, PaymasterActions } from './paymaster';
import { bitlayer } from './transport';
import { gasEstimator } from './gas-estimator';

export interface SmartAccountConfig {
  bundlerUrl: string;
  paymasterUrl: string;
  paymasterAddress: Address;
  apiKey: string;
  factoryAddress: Address;
  factoryVersion?: LightAccountVersion<'LightAccount'>;
}

export type CreateSmartAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain,
> = {
  chain: TChain;
  eoa: WalletClient<TTransport, TChain>;
  config: SmartAccountConfig;
};

export type SmartAccountClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
> = SmartAccountClientCore<
  TTransport,
  TChain,
  LightAccount<TSigner>,
  SmartAccountClientActions<Chain, SmartContractAccount> &
    LightAccountClientActions<TSigner, LightAccount<TSigner>> &
    PaymasterActions
>;

export function createSmartAccountClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
>(
  args: CreateSmartAccountClientParams<TTransport, TChain>,
): Promise<SmartAccountClient<TTransport, TChain, TSigner>>;

export async function createSmartAccountClient({
  chain,
  eoa,
  config,
}: CreateSmartAccountClientParams) {
  const {
    bundlerUrl,
    paymasterUrl,
    apiKey,
    paymasterAddress,
    factoryAddress,
    factoryVersion = 'v1.1.0',
  } = config;

  if (!chain) {
    throw new Error('Missing required parameter: chain');
  }

  const signer = new WalletClientSigner(eoa, 'json-rpc');

  const lightAccountClient = await createLightAccountClient({
    chain,
    transport: bitlayer({ bundler: bundlerUrl, paymaster: paymasterUrl }),
    signer,
    factoryAddress,
    version: factoryVersion,
    gasEstimator: gasEstimator(),
  });

  const client = lightAccountClient.extend(
    createPaymasterActions({
      apiKey: apiKey,
      address: paymasterAddress,
    }),
  );

  return client;
}
