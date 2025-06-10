import { parseEther } from 'viem';
import { FEE_CONFIG } from '../config/fees';

export const prepareFeeTransfer = (amount: bigint) => {
  return {
    to: FEE_CONFIG.PLATFORM_WALLET,
    value: amount,
  };
};