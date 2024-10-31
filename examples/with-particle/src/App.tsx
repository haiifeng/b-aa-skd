import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthType } from '@particle-network/auth-core';
import { AuthCoreContextProvider, PromptSettingType } from '@particle-network/authkit';
import { btr, btrTestnet } from '@particle-network/authkit/chains';

import { Toaster } from './components/ui/sonner';
import { SmartAccountProvider } from './components/smart-account';

import IndexPage from './index';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthCoreContextProvider
        options={{
          projectId: import.meta.env.VITE_PARTICLE_PROJECT_ID,
          clientKey: import.meta.env.VITE_PARTICLE_CLIENT_KEY,
          appId: import.meta.env.VITE_PARTICLE_APP_ID,
          chains: [btrTestnet, btr],
          authTypes: [AuthType.email, AuthType.google, AuthType.twitter],
          promptSettingConfig: {
            promptPaymentPasswordSettingWhenSign: PromptSettingType.first,
            promptMasterPasswordSettingWhenLogin: PromptSettingType.first,
          },
          wallet: {
            themeType: 'light',
            visible: true,
          },
        }}
      >
        <SmartAccountProvider>
          <IndexPage />
          <Toaster />
        </SmartAccountProvider>
      </AuthCoreContextProvider>
    </QueryClientProvider>
  );
}

export default App;
