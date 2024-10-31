import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config as wagmiConfig } from './config/wallet';
import { config as privyConfig } from './config/privy';
import { Toaster } from './components/ui/sonner';
import { SmartAccountProvider } from './components/smart-account';

import IndexPage from './index';

const queryClient = new QueryClient();

function App() {
  return (
    <PrivyProvider appId={import.meta.env.VITE_PRIVY_APPID} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <SmartAccountProvider>
            <IndexPage />
            <Toaster />
          </SmartAccountProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default App;
