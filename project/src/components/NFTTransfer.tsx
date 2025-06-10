import React from 'react';
import { useAccount, useContractWrite, useWatchContractEvent } from 'wagmi';
import { Send } from 'lucide-react';
import { Button } from './ui/Button';
import { useServiceFee } from '../hooks/useServiceFee';
import { useTransactionStatus } from '../hooks/useTransactionStatus';
import type { NFTAsset } from '../types';

interface NFTTransferProps {
  addresses: string[];
  nft: NFTAsset;
}

export function NFTTransfer({ addresses, nft }: NFTTransferProps) {
  const { isConnected } = useAccount();
  const { totalFee } = useServiceFee(addresses.length);
  const [error, setError] = React.useState<string>('');

  const { writeContract, data: hash } = useContractWrite();
  const { isLoading, isSuccess } = useTransactionStatus(hash);

  const handleTransfer = async () => {
    try {
      await writeContract({
        address: nft.contract as `0x${string}`,
        abi: [{
          inputs: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "tokenId", type: "uint256" }
          ],
          name: "transferFrom",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        }],
        functionName: 'transferFrom',
        args: [nft.identifier],
        value: totalFee,
      });
      setError('');
    } catch (err) {
      setError('Transfer failed. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
        <img
          src={nft.image_url || 'https://via.placeholder.com/100?text=No+Image'}
          alt={nft.name || 'NFT'}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div>
          <h3 className="font-semibold">{nft.name || 'Unnamed NFT'}</h3>
          <p className="text-sm text-gray-400">{nft.collection}</p>
          <p className="text-xs text-gray-500">Token ID: {nft.identifier}</p>
        </div>
      </div>

      <Button
        onClick={handleTransfer}
        disabled={!isConnected || isLoading || !addresses.length}
        icon={Send}
      >
        {isLoading ? 'Transferring...' : 'Transfer NFT'}
      </Button>

      {error && (
        <div className="p-4 bg-red-500 bg-opacity-10 text-red-500 rounded-lg">
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="p-4 bg-green-500 bg-opacity-10 text-green-500 rounded-lg">
          Successfully initiated NFT transfers!
        </div>
      )}
    </div>
  );
}