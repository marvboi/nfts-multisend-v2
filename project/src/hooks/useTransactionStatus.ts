import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import type { Hash } from 'viem';

export function useTransactionStatus(hash?: Hash) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!hash) return;

    setIsLoading(true);
    
    const watchTransaction = async () => {
      try {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        setIsSuccess(receipt.status === 'success');
      } catch (error) {
        console.error('Transaction failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    watchTransaction();
  }, [hash, publicClient]);

  return { isLoading, isSuccess };
}