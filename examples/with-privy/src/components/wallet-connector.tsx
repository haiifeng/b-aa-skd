import { useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSetActiveWallet } from '@privy-io/wagmi';
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
  const { ready, authenticated, login, logout } = usePrivy();
  const disableLogin = !ready || (ready && authenticated);

  const [selectedChainId, setSelectedChainId] = useState<string>(btrTestnet.id.toString());
  const { address, connector, chainId } = useAccount();
  const { chains, switchChain } = useSwitchChain();

  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  useEffect(() => {
    // Use the privy embedded wallet as the default wallet
    const wallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
    if (wallet) {
      setActiveWallet(wallet);
    }
  }, [wallets, setActiveWallet]);

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    logout();
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
        <Button disabled={disableLogin} onClick={handleLogin}>
          Login
        </Button>
      </div>
    );
  };

  const walletDetail = () => {
    return (
      <div className="space-y-1.5">
        {connector && (
          <div className="flex items-center gap-2">
            {connector.icon && <img src={connector.icon} alt={connector.name} className="size-4" />}
            {connector.name}
          </div>
        )}
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
        {authenticated ? walletDetail() : connectSection()}
      </CardContent>
    </Card>
  );
}
