import { toHex } from 'viem';
import {
  resolveProperties,
  deepHexlify,
  applyUserOpOverrideOrFeeOption,
  ClientMiddlewareFn,
} from '@aa-sdk/core';

export const gasEstimator =
  (): ClientMiddlewareFn =>
  async (struct, { client, account, overrides, feeOptions }) => {
    const request = deepHexlify(await resolveProperties(struct));
    const estimates = await client.estimateUserOperationGas(
      {
        ...request,

        // The light account client from account-kit/smart-contract does not set
        // the following fields in the user operation request by default.
        // Some bundler may report error when the fields are missing.
        // So we set them to 0 to avoid the error.
        callGasLimit: toHex(0),
        verificationGasLimit: toHex(0),
        preVerificationGas: toHex(0),
      },
      account.getEntryPoint().address,
      overrides?.stateOverride,
    );

    const callGasLimit = applyUserOpOverrideOrFeeOption(
      estimates.callGasLimit,
      overrides?.callGasLimit,
      feeOptions?.callGasLimit,
    );
    const verificationGasLimit = applyUserOpOverrideOrFeeOption(
      estimates.verificationGasLimit,
      overrides?.verificationGasLimit,
      feeOptions?.verificationGasLimit,
    );
    const preVerificationGas = applyUserOpOverrideOrFeeOption(
      estimates.preVerificationGas,
      overrides?.preVerificationGas,
      feeOptions?.preVerificationGas,
    );

    struct.callGasLimit = callGasLimit;
    struct.verificationGasLimit = verificationGasLimit;
    struct.preVerificationGas = preVerificationGas;
    return struct;
  };
