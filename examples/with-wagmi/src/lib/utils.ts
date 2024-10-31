import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Chain, toHex } from 'viem';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buildExplorerAddressUrl = (chain: Chain | undefined, hash: string) => {
  if (!chain) {
    return '';
  }
  return `${chain.blockExplorers?.default.url}/address/${hash}`;
};

export const buildExplorerTransactionUrl = (chain: Chain | undefined, hash: string) => {
  if (!chain) {
    return '';
  }
  return `${chain.blockExplorers?.default.url}/tx/${hash}`;
};

export function increaseGasLimit(
  gasLimit: number | bigint | `0x${string}` | undefined,
): `0x${string}` | undefined {
  if (gasLimit === undefined) {
    return undefined;
  }
  const gasLimitBN = BigInt(gasLimit);
  const increase = (gasLimitBN * 3n) / 2n;
  return toHex(increase);
}
