import React from 'react';
import { useServiceFee } from '../hooks/useServiceFee';
import { formatEther } from 'viem';

interface TransferSummaryProps {
  addresses: string[];
}

export function TransferSummary({ addresses }: TransferSummaryProps) {
  const { totalFee, feePerTransfer } = useServiceFee(addresses.length);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4">Transfer Summary</h2>
      <div className="space-y-2 text-gray-300">
        <p>Number of recipients: {addresses.length}</p>
        <p>Fee per transfer: {formatEther(feePerTransfer)} BASE</p>
        <p>Total platform fee: {formatEther(totalFee)} BASE</p>
      </div>
    </div>
  );
}