import { parseEther } from 'viem';
import type { NFTTransferData } from '../types';

export const prepareTransferData = ({ contractAddress, tokenId }: NFTTransferData) => {
  return {
    address: contractAddress as `0x${string}`,
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
    args: [parseEther(tokenId)]
  };
};