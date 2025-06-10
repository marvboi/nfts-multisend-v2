export const BASE_MAINNET_ID = 8453;
export const SERVICE_FEE_USD = 1;
export const SUPPORTED_FILE_TYPES = ['text/csv'];
export const MAX_BATCH_SIZE = 50; // Maximum NFTs per batch for gas optimization
export const ETHERSCAN_BASE_URL = 'https://basescan.org';

export const ERROR_MESSAGES = {
  INVALID_ADDRESS: 'Invalid Ethereum address provided',
  INSUFFICIENT_BALANCE: 'Insufficient balance for gas fees and service charge',
  UNAUTHORIZED: 'Not authorized to transfer this NFT',
  NETWORK_ERROR: 'Please connect to Base mainnet',
  FILE_FORMAT: 'Invalid file format. Please use CSV',
} as const;