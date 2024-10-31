import { http, createConfig } from 'wagmi';
import { btr, btrTestnet } from 'wagmi/chains';

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
});
