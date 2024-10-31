import { Chain } from 'viem';
import { useQuery } from '@tanstack/react-query';
import useCopy from '@react-hook/copy';
import { CopyIcon } from '@radix-ui/react-icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldList } from '@/components/ui/field';
import { useSmartAccount } from '@/hooks/smart-account';
import { buildExplorerAddressUrl, cn } from '@/lib/utils';
import { useEthereum } from '@particle-network/authkit';

const AddressLink = ({ chain, address = '' }: { chain: Chain; address?: string }) => {
  const { copied, copy, reset } = useCopy(address);

  if (!address) {
    return null;
  }

  const handleClickCopy = () => {
    copy();
    setTimeout(reset, 1000);
  };

  return (
    <div className="flex gap-2">
      <a
        href={buildExplorerAddressUrl(chain, address)}
        target="_blank"
        rel="noreferrer"
        className="text-sm block underline font-mono w-fit hover:font-semibold"
      >
        {address}
      </a>
      <button
        className={cn('text-gray-400 hover:text-black', {
          'text-gray-200 hover:text-gray-200': copied,
        })}
        onClick={handleClickCopy}
      >
        <CopyIcon />
      </button>
    </div>
  );
};

export function AccountCard() {
  const { chainInfo: chain } = useEthereum();
  const { client, eoa } = useSmartAccount();

  const account = client?.account;

  const { data: isAccountDeployed } = useQuery({
    queryKey: ['smartAccount/isAccountDeployed', account?.address],
    queryFn: () => account?.isAccountDeployed(),
    enabled: !!account,
  });

  const { data: factoryAddress } = useQuery({
    queryKey: ['smartAccount/factoryAddress', account?.address],
    queryFn: () => account?.getFactoryAddress(),
    enabled: !!account,
  });

  return (
    <Card className="w-full lg:max-w-lg">
      <CardHeader>
        <CardTitle>Smart Account</CardTitle>
        <CardDescription>Smart account information.</CardDescription>
      </CardHeader>
      <CardContent>
        {account && chain && (
          <FieldList>
            <Field label="Chain ID" description={chain.name}>
              {chain.id}
            </Field>
            <Field
              label="Smart Account Address"
              description={isAccountDeployed ? 'Deployed' : 'Not deployed'}
            >
              <AddressLink chain={chain} address={account.address} />
            </Field>
            <Field label="Owner">
              <AddressLink chain={chain} address={eoa?.account?.address} />
            </Field>
            <Field label="EOA Address">
              <AddressLink chain={chain} address={eoa?.account?.address} />
            </Field>
            <Field label="Entry Point Address" description="Version 0.6">
              <AddressLink chain={chain} address={account.getEntryPoint().address} />
            </Field>
            <Field label="Factory Address" description="LightAccount Version v1.1.0">
              <AddressLink chain={chain} address={factoryAddress} />
            </Field>
          </FieldList>
        )}
      </CardContent>
    </Card>
  );
}
