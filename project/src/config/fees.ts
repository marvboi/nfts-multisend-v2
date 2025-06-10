import { Address } from 'viem';

export const FEE_CONFIG = {
  PLATFORM_WALLET: '0xf9B08E3c7AE67B054163f9e2c819c5113701c987' as Address,
  MIN_TRANSFER_AMOUNT: BigInt(1e14), // 0.0001 BASE
  MAX_BATCH_WAIT: 3600, // 1 hour in seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;