import '@rainbow-me/rainbowkit/styles.css';

import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem'

// Your WalletConnect Project ID (you provided)
const projectId = '5f2d37a311aabaf327463f72b47a8cf1';

// Create wagmi config directly using RainbowKit's helper
export const wagmiConfig = getDefaultConfig({
  appName: 'NFT Multi-Sender',
  projectId,
  chains: [base, mainnet], // Prioritizing Base mainnet
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

export const queryClient = new QueryClient();

export { WagmiConfig, RainbowKitProvider, QueryClientProvider };
