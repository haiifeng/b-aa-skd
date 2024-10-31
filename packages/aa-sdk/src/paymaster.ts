import { Address, Chain, Client, Hash, Prettify, RpcSchema, Transport } from 'viem';
import {
  UserOperationRequest,
  EntryPointVersion,
  SmartContractAccount,
  GetEntryPointFromAccount,
  AccountNotFoundError,
  UserOperationStruct,
  SmartAccountClient,
} from '@aa-sdk/core';

export type PaymasterNativeToken = {
  gas: Hash;
  price: number;
  decimals: number;
  symbol: string;
};
export type PaymasterTokenType = 'system' | 'custom';
export type PaymasterSupportedToken = {
  type: PaymasterTokenType;
  token: Address;
  symbol: string;
  decimals: number;
  price: number;
};

export type PaymasterSupportedTokensResponse = {
  freeGas: boolean;
  native: PaymasterNativeToken;
  tokens: PaymasterSupportedToken[];
};

export type PaymasterSponsorType = '0' | '1' | '2';
export const PaymasterSponsorTypeNative: PaymasterSponsorType = '0';
export const PaymasterSponsorTypePrefund: PaymasterSponsorType = '1';
export const PaymasterSponsorTypePostfund: PaymasterSponsorType = '2';

export type PaymasterSponsorContext = {
  type: PaymasterSponsorType;
  token: Address;
};

export type PaymasterSponsorUserOpResponse = {
  paymasterAndData: Hash;
  callGasLimit: number | bigint | Hash;
  verificationGasLimit: number | bigint | Hash;
  preVerificationGas: number | bigint | Hash;
};

export type PaymasterRpcSchema = [
  {
    Method: 'pm_supported_tokens';
    Parameters: [UserOperationRequest, string, Address];
    ReturnType: PaymasterSupportedTokensResponse;
  },
  {
    Method: 'pm_sponsor_userop';
    Parameters: [UserOperationRequest, string, Address, PaymasterSponsorContext];
    ReturnType: PaymasterSponsorUserOpResponse;
  },
  {
    Method: 'pm_entrypoints';
    Parameters: ['entryPoint'];
    ReturnType: Address[];
  },
];

export type GetSupportedTokenParams<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
> = {
  request: UserOperationRequest<TEntryPointVersion>;
};

export const getSupportedTokens = async <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TClient extends Client<Transport, Chain | undefined, any, PaymasterRpcSchema>,
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
>(
  client: TClient,
  apiKey: string,
  args: GetSupportedTokenParams<TEntryPointVersion>,
): Promise<PaymasterSupportedTokensResponse> => {
  const account = client.account;
  if (!account) {
    throw new AccountNotFoundError();
  }

  return client.request({
    method: 'pm_supported_tokens',
    params: [args.request, apiKey, account.getEntryPoint().address],
  });
};

export type GetSponsorUserOpParams<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
> = {
  request: UserOperationRequest<TEntryPointVersion>;
  token: PaymasterSponsorContext;
};

export const getSponsorUserOp = async <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TClient extends Client<Transport, Chain | undefined, any, PaymasterRpcSchema>,
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
>(
  client: TClient,
  apiKey: string,
  args: GetSponsorUserOpParams<TEntryPointVersion>,
): Promise<PaymasterSponsorUserOpResponse> => {
  const account = client.account;
  if (!account) {
    throw new AccountNotFoundError();
  }

  return client.request({
    method: 'pm_sponsor_userop',
    params: [args.request, apiKey, account.getEntryPoint().address, args.token],
  });
};

export type PaymasterActions<TEntryPointVersion extends EntryPointVersion = EntryPointVersion> = {
  /**
   * @returns the contract address of the paymaster
   */
  get paymasterAddress(): Address;

  /**
   * calls `pm_supported_tokens` and  returns the result
   *
   * @param request - the UserOperationRequest to estimate gas for
   * @returns supported tokens for the given user operation
   */
  getSupportedTokens(
    request: UserOperationStruct<TEntryPointVersion>,
  ): Promise<PaymasterSupportedTokensResponse>;

  /**
   * calls `pm_sponsor_userop` and  returns the result
   *
   * @param request - the UserOperationRequest to estimate gas for
   * @param token - the token to sponsor the user operation with
   * @returns the paymaster and data for the given user operation
   */
  getSponsorUserOp(
    request: UserOperationStruct<TEntryPointVersion>,
    token: PaymasterSponsorContext,
  ): Promise<PaymasterSponsorUserOpResponse>;
};

export type PaymasterClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined = SmartContractAccount | undefined,
  rpcSchema extends RpcSchema = PaymasterRpcSchema,
  actions extends PaymasterActions = PaymasterActions,
> = Prettify<Client<transport, chain, account, rpcSchema, actions>>;

export const createPaymasterClientFromSmartAccountClient = <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined,
>({
  client,
  apiKey,
  address,
}: CreatePaymasterActionsConfig & {
  client: SmartAccountClient<TTransport, TChain, TAccount>;
}): PaymasterClient<TTransport, TChain, TAccount> => {
  return client.extend(createPaymasterActions({ apiKey, address })) as PaymasterClient<
    TTransport,
    TChain,
    TAccount
  >;
};

export type CreatePaymasterActionsConfig = {
  apiKey: string;
  address: Address;
};

export const createPaymasterActions = ({ apiKey, address }: CreatePaymasterActionsConfig) => {
  return <
    TTransport extends Transport = Transport,
    TChain extends Chain | undefined = Chain | undefined,
    TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined,
    TEntryPointVersion extends
      GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>,
  >(
    client: Client<TTransport, TChain, TAccount>,
  ) => ({
    get paymasterAddress() {
      return address;
    },
    getSupportedTokens: (request: UserOperationRequest<TEntryPointVersion>) =>
      getSupportedTokens(client, apiKey, {
        request,
      }),
    getSponsorUserOp: (
      request: UserOperationRequest<TEntryPointVersion>,
      token: PaymasterSponsorContext,
    ) =>
      getSponsorUserOp(client, apiKey, {
        request,
        token,
      }),
  });
};
