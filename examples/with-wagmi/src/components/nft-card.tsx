import { encodeFunctionData, erc20Abi, Hash, parseUnits } from 'viem';
import { toast } from 'sonner';
import { abi } from '@/abi/nft';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldList } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useSponsorUserOperation } from '@/hooks/sponsor-user-op';
import { buildExplorerTransactionUrl, cn } from '@/lib/utils';
import { Checkbox } from './ui/checkbox';
import { useState } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  PaymasterSponsorContext,
  PaymasterSponsorType,
  PaymasterSponsorTypeNative,
  PaymasterSponsorTypePostfund,
  PaymasterSponsorTypePrefund,
} from '@bitlayer/aa-sdk';
import { useSmartAccount } from '@/hooks/smart-account';

const nftContractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
const sponsorTokenAddress = import.meta.env.VITE_SPONSOR_TOKEN_ADDRESS;

export function NFTCard() {
  const { client } = useSmartAccount();

  const [isUsingErc20, setIsUsingErc20] = useState(false);
  const [isInBatch, setIsInBatch] = useState(false);

  const { send, isPending } = useSponsorUserOperation({ client });

  const [amount, setAmount] = useState('20');
  const [sponsorType, setSponsorType] = useState<PaymasterSponsorType>(
    PaymasterSponsorTypePostfund,
  );

  const handleMint = async () => {
    if (!client) {
      return;
    }

    const chain = client.chain;
    const account = client.account;

    const allowance = parseUnits(amount, 18);
    const sponsorContext: PaymasterSponsorContext = isUsingErc20
      ? {
          type: sponsorType,
          token: sponsorTokenAddress,
        }
      : {
          type: PaymasterSponsorTypeNative, // free gas
          token: '0x',
        };

    try {
      let hash: Hash;

      if (isInBatch) {
        hash = await send({
          txs: {
            account,
            requests: [
              {
                to: sponsorTokenAddress,
                data: encodeFunctionData({
                  abi: erc20Abi,
                  functionName: 'approve',
                  args: [client.paymasterAddress, allowance],
                }),
              },
              {
                to: nftContractAddress,
                data: encodeFunctionData({
                  abi: abi,
                  functionName: 'mint',
                  args: [account.address],
                }),
              },
            ],
          },
          sponsorContext,
        });
      } else {
        hash = await send({
          tx: {
            account,
            chain,
            to: nftContractAddress,
            data: encodeFunctionData({
              abi: abi,
              functionName: 'mint',
              args: [account.address],
            }),
          },
          sponsorContext,
        });
      }
      toast('Minted', {
        action: {
          label: 'View on Explorer',
          onClick: () => {
            const link = buildExplorerTransactionUrl(chain, hash);
            window.open(link);
          },
        },
      });
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        'Error occurred while minting NFT. Please open the DevTools for more information.',
      );
    }
  };

  const handleApprove = async () => {
    if (!client) {
      return;
    }

    const chain = client.chain;
    const account = client.account;

    try {
      const allowance = parseUnits(amount, 18);
      const hash = await send({
        tx: {
          chain: client.chain,
          account: account,
          to: sponsorTokenAddress,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [client.paymasterAddress, allowance],
          }),
        },
        sponsorContext: {
          type: PaymasterSponsorTypeNative,
          token: '0x',
        },
      });
      toast('Approved', {
        action: {
          label: 'View on Explorer',
          onClick: () => {
            const link = buildExplorerTransactionUrl(chain, hash);
            window.open(link);
          },
        },
      });
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        'Error occurred while minting NFT. Please open the DevTools for more information.',
      );
    }
  };

  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mint NFT</CardTitle>
        <CardDescription>
          This example shows how to interact with a smart account client and paymaster by minting an
          NFT.
        </CardDescription>
        <CardDescription>
          By default, the gas fee is sponsored by the paymaster with the native token (BTC).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldList>
          <Field label="NFT Contract Address">
            <span className="font-mono">{nftContractAddress}</span>
          </Field>

          <FieldPayWithERC20 isUsingErc20={isUsingErc20} setIsUsingErc20={setIsUsingErc20} />

          <FieldList
            className={cn('hidden p-4 pb-6 rounded bg-blue-50', {
              block: isUsingErc20,
            })}
          >
            <Field label="ERC20 Token Address">
              <span className="font-mono">{sponsorTokenAddress}</span>
            </Field>
            <Field
              label="ERC20 Token Amount"
              description="The amount you approve the paymaster to spend"
            >
              <div className="flex gap-2">
                <Input placeholder="" type="number" value={amount} onChange={handleChangeAmount} />
                <Button disabled={!client || isPending || isInBatch} onClick={handleApprove}>
                  Approve
                </Button>
              </div>
            </Field>
            <Field label="Type">
              <Select
                value={sponsorType}
                onValueChange={(value: string) => setSponsorType(value as '1' | '2')}
              >
                <SelectTrigger>
                  <SelectValue></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymasterSponsorTypePrefund}>Prefund (1)</SelectItem>
                  <SelectItem value={PaymasterSponsorTypePostfund}>Postfund (2)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldList>

          <FieldInBatch
            isUsingErc20={isUsingErc20}
            isInBatch={isInBatch}
            setIsInBatch={setIsInBatch}
          />

          <div className="pt-3">
            <Button disabled={!client || isPending} onClick={handleMint}>
              {isInBatch ? 'Approve and Mint' : 'Mint'}
            </Button>
          </div>
        </FieldList>
      </CardContent>
    </Card>
  );
}

function FieldPayWithERC20({
  isUsingErc20,
  setIsUsingErc20,
}: {
  isUsingErc20: boolean;
  setIsUsingErc20: (value: boolean) => void;
}) {
  return (
    <Field
      className="py-3"
      description="Please make sure there is enough ERC20 tokens in the smart account."
    >
      <div className="flex items-center space-x-2 pb-1">
        <Checkbox
          id="using-erc20"
          checked={isUsingErc20}
          onCheckedChange={(state) => setIsUsingErc20(state === 'indeterminate' ? false : state)}
        />
        <label
          htmlFor="using-erc20"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Pay gas with ERC20 tokens
        </label>
      </div>
    </Field>
  );
}

function FieldInBatch({
  isUsingErc20,
  isInBatch,
  setIsInBatch,
}: {
  isUsingErc20: boolean;
  isInBatch: boolean;
  setIsInBatch: (value: boolean) => void;
}) {
  return (
    <Field
      className={cn({ hidden: !isUsingErc20 })}
      description={
        isInBatch
          ? 'Click the Approve and Mint button below, it combines the approve and mint in a single transaction. The gas fee is paid with ERC20 tokens in the smart account.'
          : 'Click the Approve button above to approve the paymaster to spend your ERC20 tokens. The gas fee is sponsored by the paymaster with the native token (BTC).'
      }
    >
      <div className="flex items-center space-x-2 pb-1">
        <Checkbox
          id="in-batch"
          checked={isInBatch}
          onCheckedChange={(state) => setIsInBatch(state === 'indeterminate' ? false : state)}
        />
        <label
          htmlFor="in-batch"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Build the approve transaction and mint transaction in a batch
        </label>
      </div>
    </Field>
  );
}
