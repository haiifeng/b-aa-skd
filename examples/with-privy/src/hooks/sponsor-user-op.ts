import { useMutation } from '@tanstack/react-query';
import { Chain, SendTransactionParameters, Transport } from 'viem';
import { PaymasterSponsorContext, SmartAccountClient } from '@bitlayer/aa-sdk';
import {
  BuildTransactionParameters,
  SmartContractAccount,
  UserOperationContext,
  UserOperationStruct_v6,
  UserOperationStruct_v7,
} from '@aa-sdk/core';

export interface UseSponsorUserOperationParams<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
> {
  client?: SmartAccountClient<transport, chain>;
}

export interface UseSponsorUserOpMutationParams<
  TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined,
  TContext extends UserOperationContext | undefined = UserOperationContext | undefined,
> {
  tx?: SendTransactionParameters;
  txs?: BuildTransactionParameters<TAccount, TContext>;
  sponsorContext: PaymasterSponsorContext;
}

export const useSponsorUserOperation = <
  TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined,
  TContext extends UserOperationContext | undefined = UserOperationContext | undefined,
>(
  params: UseSponsorUserOperationParams = {},
) => {
  const mutation = useMutation({
    mutationFn: async ({
      tx,
      txs,
      sponsorContext,
    }: UseSponsorUserOpMutationParams<TAccount, TContext>) => {
      const { client } = params;
      if (!client) {
        console.error('Smart account not ready');
        throw new Error('Smart account not ready');
      }

      let userOp: UserOperationStruct_v6 | UserOperationStruct_v7;
      if (tx) {
        userOp = await client.buildUserOperationFromTx(tx);
      } else if (txs) {
        const result = await client.buildUserOperationFromTxs(txs);
        userOp = result.uoStruct;
      } else {
        throw new Error('tx or txs required');
      }

      console.log('eth_estimateUserOperation response:', userOp);

      const supportedTokens = await client.getSupportedTokens(userOp);
      console.log('SupportedTokens: ', supportedTokens);

      if (supportedTokens.freeGas || supportedTokens.tokens.length > 0) {
        const paymasterResponse = await client.getSponsorUserOp(userOp, sponsorContext);
        console.log('pm_sponsor_userop respnose:', paymasterResponse);

        userOp = {
          ...userOp,
          ...paymasterResponse,
        };
      }

      const request = await client.signUserOperation({
        account: client.account,
        uoStruct: userOp,
      });

      const userOpHash = await client.sendRawUserOperation(
        request,
        client.account.getEntryPoint().address,
      );
      console.log('UserOperation hash:', userOpHash);

      const txHash = await client.waitForUserOperationTransaction({
        hash: userOpHash,
        retries: {
          maxRetries: 10,
          intervalMs: 5000,
          multiplier: 1.5,
        },
      });
      return txHash;
    },
  });

  return {
    send: mutation.mutateAsync,
    ...mutation,
  };
};
