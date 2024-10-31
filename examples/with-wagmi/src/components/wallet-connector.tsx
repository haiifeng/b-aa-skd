import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { btrTestnet } from 'viem/chains';
import { BitlayerIcon } from './icons/bitlayer';

export function WalletConnector() {
  const [selectedChainId, setSelectedChainId] = useState<string>(btrTestnet.id.toString());
  const { address, connector, chainId } = useAccount();
  const { chains, switchChain } = useSwitchChain();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [connectorId, setConnectorId] = useState<string | undefined>(connectors[0]?.id);

  const handleConnect = () => {
    if (!connectorId) {
      return;
    }
    const connector = connectors.find((c) => c.id === connectorId);
    if (!connector) {
      return;
    }
    connect({ connector, chainId: parseInt(selectedChainId) });
  };

  const handleSelectChain = (value: string) => {
    const expectedChainId = parseInt(value);
    setSelectedChainId(value);

    if (chainId === expectedChainId) {
      return;
    }
    switchChain({ chainId: expectedChainId });
  };

  useEffect(() => {
    if (chainId !== parseInt(selectedChainId)) {
      switchChain({ chainId: parseInt(selectedChainId) });
    }
  }, [chainId, selectedChainId, switchChain]);

  const connectSection = () => {
    return (
      <div className="flex gap-2 items-center">
        <Select onValueChange={setConnectorId} value={connectorId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a wallet" />
          </SelectTrigger>
          <SelectContent>
            {connectors.map((connector) => (
              <SelectItem value={connector.id} key={connector.id}>
                <div className="flex items-center gap-2">
                  <img src={connector.icon} alt={connector.name} className="size-4" />
                  <span>{connector.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleConnect}>Connect</Button>
      </div>
    );
  };

  const walletDetail = () => {
    return (
      <div className="space-y-1.5">
        {connector && (
          <div className="flex items-center gap-2">
            <img src={connector.icon} alt={connector.name} className="size-4" />
            {connector.name}
          </div>
        )}
        <p className="text-sm font-medium">{address}</p>
        <Button variant="destructive" size="sm" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    );
  };

  return (
    <Card className="w-full lg:max-w-lg">
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
        <CardDescription>Connect wallet to enable other functions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-1">
          <Label>Network</Label>
          <Select onValueChange={handleSelectChain} value={selectedChainId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a chain" />
            </SelectTrigger>
            <SelectContent>
              {chains.map((chain) => (
                <SelectItem value={chain.id.toString()} key={chain.id}>
                  <div className="flex items-center gap-2">
                    <BitlayerIcon className="size-4" />
                    <span>{chain.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {address ? walletDetail() : connectSection()}
      </CardContent>
    </Card>
  );
}
