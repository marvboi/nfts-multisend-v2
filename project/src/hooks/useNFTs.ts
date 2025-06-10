import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import type { NFTAsset } from '../types';

const OPENSEA_API_KEY = '29120e0ef88e40e2b8d7a9ae30ffd260';
const OPENSEA_API_URL = 'https://api.opensea.io/api/v2';

export function useNFTs() {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFTAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${OPENSEA_API_URL}/chain/base/account/${address}/nfts`,
          {
            headers: {
              'X-API-KEY': OPENSEA_API_KEY,
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch NFTs');
        }

        const data = await response.json();
        setNfts(data.nfts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [address]);

  return { nfts, isLoading, error };
}