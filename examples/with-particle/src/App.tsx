import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Toaster } from './components/ui/sonner';
import { SmartAccountProvider } from './components/smart-account';

import IndexPage from './index';
import { ParticleConnectkit } from './components/connectkit';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ParticleConnectkit>
        <SmartAccountProvider>
          <IndexPage />
          <Toaster />
        </SmartAccountProvider>
      </ParticleConnectkit>
    </QueryClientProvider>
  );
}

export default App;
