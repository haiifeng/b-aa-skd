import { http, createConfig } from 'wagmi';
import { btr, btrTestnet } from 'wagmi/chains';
import { particle } from './particle';

const particleConnector = particle({
  config: {
    projectId: import.meta.env.VITE_PARTICLE_PROJECT_ID,
    clientKey: import.meta.env.VITE_PARTICLE_CLIENT_KEY,
    appId: import.meta.env.VITE_PARTICLE_APP_ID,
  },
  login: {},
});

export const config = createConfig({
  chains: [
    // btr,
    btrTestnet,
  ],
  transports: {
    [btr.id]: http(),
    [btrTestnet.id]: http(),
  },
  ssr: false,
  // multiInjectedProviderDiscovery: false,
  connectors: [particleConnector],
});
