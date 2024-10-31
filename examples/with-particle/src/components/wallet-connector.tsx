import { useEffect, useState } from 'react';
import { useConnect, useEthereum } from '@particle-network/authkit';
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
import { btr, btrTestnet } from 'viem/chains';
import { BitlayerIcon } from './icons/bitlayer';

export function WalletConnector() {
  const chains = [btr, btrTestnet];
  const [selectedChainId, setSelectedChainId] = useState<string>(btrTestnet.id.toString());
  const { connect, disconnect, connected } = useConnect();
  const {
    address, // EVM public address
    chainId, // Current chain
    switchChain,
  } = useEthereum();

  const handleLogin = async () => {
    if (!connected) {
      await connect({});
    }
  };

  // Logout user
  const handleLogout = async () => {
    await disconnect();
  };

  const handleSelectChain = (value: string) => {
    const expectedChainId = parseInt(value);
    setSelectedChainId(value);

    if (chainId === expectedChainId) {
      return;
    }
    switchChain(expectedChainId);
  };

  useEffect(() => {
    if (chainId !== parseInt(selectedChainId)) {
      switchChain(parseInt(selectedChainId));
    }
  }, [chainId, selectedChainId, switchChain]);

  const connectSection = () => {
    return (
      <div className="flex gap-2 items-center">
        <Button onClick={handleLogin}>Login</Button>
      </div>
    );
  };

  const walletDetail = () => {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">Particle</div>
        <p className="text-sm font-medium">{address}</p>
        <Button variant="destructive" size="sm" onClick={handleLogout}>
          Logout
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
