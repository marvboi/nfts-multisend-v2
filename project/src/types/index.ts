export interface NFTTransferData {
  contractAddress: string;
  tokenId: string;
}

export interface TransferStatus {
  isLoading: boolean;
  isSuccess: boolean;
  error?: string;
}

export interface WalletAddress {
  address: string;
  isValid: boolean;
}

export interface NFTAsset {
  identifier: string;
  collection: string;
  contract: string;
  token_standard: string;
  name: string;
  description: string;
  image_url: string;
  metadata_url: string;
  created_at: string;
  updated_at: string;
  is_disabled: boolean;
  is_nsfw: boolean;
}

export interface NFTGridProps {
  nfts: NFTAsset[];
  onSelect: (nft: NFTAsset) => void;
  selectedNft?: NFTAsset;
}