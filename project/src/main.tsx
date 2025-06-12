import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  WagmiProvider,
  RainbowKitProvider,
  wagmiConfig,
  queryClient,
  QueryClientProvider
} from './config/rainbowkit';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);