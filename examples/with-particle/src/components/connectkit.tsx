import React from 'react';
import { ConnectKitProvider, createConfig } from '@particle-network/connectkit';
import { authWalletConnectors } from '@particle-network/connectkit/auth';
import { btr, btrTestnet } from '@particle-network/connectkit/chains';
import { wallet, EntryPosition } from '@particle-network/connectkit/wallet';
import { evmWalletConnectors } from '@particle-network/connectkit/evm';

const config = createConfig({
  projectId: import.meta.env.VITE_PARTICLE_PROJECT_ID,
  clientKey: import.meta.env.VITE_PARTICLE_CLIENT_KEY,
  appId: import.meta.env.VITE_PARTICLE_APP_ID,
  appearance: {
    // Optional, collection of properties to alter the appearance of the connection modal
    // Optional, label and sort wallets (to be shown in the connection modal)
    recommendedWallets: [
      { walletId: 'metaMask', label: 'Recommended' },
      { walletId: 'coinbaseWallet', label: 'popular' },
    ],
    splitEmailAndPhone: false, // Optional, displays Email and phone number entry separately
    collapseWalletList: false, // Optional, hide wallet list behind a button
    hideContinueButton: false, // Optional, remove "Continue" button underneath Email or phone number entry
    connectorsOrder: ['email', 'phone', 'social', 'wallet'], //  Optional, sort connection methods (index 0 will be placed at the top)
    language: 'en-US', // Optional, also supported ja-JP, zh-CN, zh-TW, and ko-KR
    mode: 'light', // Optional, changes theme between light, dark, or auto (which will change it based on system settings)
    theme: {
      '--pcm-accent-color': '#e36e1b',
      // ... other options
    },
    filterCountryCallingCode: (countries) => {
      // Optional, whitelist or blacklist phone numbers from specific countries
      return countries.filter((item) => item === 'US');
    },
  },
  walletConnectors: [
    evmWalletConnectors({}),
    authWalletConnectors({
      // Optional, configure this if you're using social logins
      authTypes: ['email', 'google', 'apple', 'twitter', 'github'], // Optional, restricts the types of social logins supported
      fiatCoin: 'USD', // Optional, also supports CNY, JPY, HKD, INR, and KRW
      promptSettingConfig: {
        // Optional, changes the frequency in which the user is asked to set a master or payment password
        // 0 = Never ask
        // 1 = Ask once
        // 2 = Ask always, upon every entry
        // 3 = Force the user to set this password
        promptMasterPasswordSettingWhenLogin: 1,
        promptPaymentPasswordSettingWhenSign: 1,
      },
    }),
  ],
  plugins: [
    wallet({
      // Optional configurations for the attached embedded wallet modal
      entryPosition: EntryPosition.BR, // Alters the position in which the modal button appears upon login
      visible: true, // Dictates whether or not the wallet modal is included/visible or not
    }),
  ],
  chains: [btrTestnet],
});

// Export ConnectKitProvider to be used within your index or layout file (or use createConfig directly within those files).
export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {
  return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>;
};
