import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './wallet/config';
import { Toaster } from './components/ui/sonner';
import { SmartAccountProvider } from './components/smart-account';

import IndexPage from './index';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SmartAccountProvider>
          <IndexPage />
          <Toaster />
        </SmartAccountProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
