import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  WagmiConfig,
  RainbowKitProvider,
  wagmiConfig,
  queryClient,
  QueryClientProvider
} from './config/rainbowkit';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  </StrictMode>
);