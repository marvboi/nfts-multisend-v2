import React, { useState } from 'react';
import { AddressInput } from './address/AddressInput';
import { NFTGrid } from './NFTGrid';
import { NFTTransfer } from './NFTTransfer';
import { useNFTs } from '../hooks/useNFTs';
import type { NFTAsset } from '../types';

interface NFTTransferFormProps {
  addresses: string[];
  setAddresses: (addresses: string[]) => void;
}

export function NFTTransferForm({ addresses, setAddresses }: NFTTransferFormProps) {
  const { nfts, isLoading, error } = useNFTs();
  const [selectedNft, setSelectedNft] = useState<NFTAsset | undefined>();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Recipient Addresses</h2>
        <AddressInput 
          addresses={addresses} 
          setAddresses={setAddresses} 
        />
      </div>

      {addresses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Select NFT to Transfer</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading your NFTs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
          ) : (
            <NFTGrid
              nfts={nfts}
              onSelect={setSelectedNft}
              selectedNft={selectedNft}
            />
          )}
        </div>
      )}

      {selectedNft && addresses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Transfer Details</h2>
          <NFTTransfer
            addresses={addresses}
            nft={selectedNft}
          />
        </div>
      )}
    </div>
  );
}