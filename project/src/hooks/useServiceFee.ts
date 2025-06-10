import { useMemo } from 'react';
import { parseEther } from 'viem';
import { FEE_CONFIG } from '../config/fees';

export function useServiceFee(transferCount: number) {
  const feePerTransfer = FEE_CONFIG.MIN_TRANSFER_AMOUNT;
  
  const totalFee = useMemo(() => {
    return feePerTransfer * BigInt(transferCount);
  }, [feePerTransfer, transferCount]);

  return {
    feePerTransfer,
    totalFee
  };
}