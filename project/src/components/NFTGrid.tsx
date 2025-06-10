import React from 'react';
import type { NFTGridProps } from '../types';

export function NFTGrid({ nfts, onSelect, selectedNft }: NFTGridProps) {
  if (!nfts.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        No NFTs found in this wallet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {nfts.map((nft) => (
        <button
          key={`${nft.contract}-${nft.identifier}`}
          onClick={() => onSelect(nft)}
          className={`relative group rounded-lg overflow-hidden border-2 transition-all
            ${selectedNft?.identifier === nft.identifier
              ? 'border-blue-500 shadow-lg scale-[1.02]'
              : 'border-gray-700 hover:border-gray-500'
            }`}
        >
          <div className="aspect-square">
            <img
              src={nft.image_url || 'https://via.placeholder.com/300?text=No+Image'}
              alt={nft.name || 'NFT'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <p className="text-sm font-semibold truncate">{nft.name || 'Unnamed NFT'}</p>
              <p className="text-xs text-gray-300 truncate">{nft.collection}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}