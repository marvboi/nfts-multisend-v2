import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { base } from 'wagmi/chains';
import { NFTMultiSenderABI, NFT_MULTI_SENDER_ADDRESS } from '../abis/NFTMultiSender';
import { Theme } from '../hooks/useTheme';

interface Recipient {
  address: string;
  tokenId: string;
}

export interface NFTMultiSenderProps {
  theme?: Theme;
  preSelectedNFTs?: {
    contractAddress: string;
    tokenIds: string[];
  }[];
}

const NFTMultiSender: React.FC<NFTMultiSenderProps> = ({ theme = 'cream', preSelectedNFTs }) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Component state
  const [nftContractAddress, setNftContractAddress] = useState(preSelectedNFTs && preSelectedNFTs.length > 0 ? preSelectedNFTs[0].contractAddress : '');
  const [recipients, setRecipients] = useState<Recipient[]>(
    preSelectedNFTs && preSelectedNFTs.length > 0 && preSelectedNFTs[0].tokenIds.length > 0
      ? preSelectedNFTs[0].tokenIds.map(tokenId => ({ address: '', tokenId }))
      : [{ address: '', tokenId: '' }]
  );
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isApprovalNeeded, setIsApprovalNeeded] = useState(true);
  const [isApprovalPending, setIsApprovalPending] = useState(false);
  const [useRandomTokenIds, setUseRandomTokenIds] = useState(false);
  const [ownedTokenIds, setOwnedTokenIds] = useState<string[]>([]);
  
  // Check if wallet is connected to Base mainnet
  useEffect(() => {
    if (isConnected && chainId && chainId !== base.id) {
      setError(`Please switch to Base mainnet to use this feature.`);
    } else {
      setError(null);
    }
  }, [isConnected, chainId]);
  
  // Handle network switching
  const handleSwitchNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: base.id });
    }
  };
  
  // Track approvals for individual token IDs
  const [approvedTokenIds, setApprovedTokenIds] = useState<Set<string>>(new Set());
  
  // Track which collections have been approved
  const [approvedCollections, setApprovedCollections] = useState<Set<string>>(new Set());
  
  // Get public client from wagmi for contract reads
  const publicClient = usePublicClient();
  
  // Check if collection needs approval using setApprovalForAll status
  const checkApprovalStatus = async () => {
    if (!nftContractAddress || !isConnected || !address || !publicClient) {
      console.log('Missing required parameters to check approval');
      return;
    }
    
    try {
      console.log('Checking approval status for collection:', nftContractAddress);
      console.log('Connected wallet address:', address);
      console.log('MultiSender contract to check approval for:', NFT_MULTI_SENDER_ADDRESS);
      
      // Check if we have approval for all tokens in the collection
      const isApprovedForAll = await publicClient.readContract({
        address: nftContractAddress as `0x${string}`,
        abi: [{
          "inputs": [
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "address", "name": "operator", "type": "address" }
          ],
          "name": "isApprovedForAll",
          "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
          "stateMutability": "view",
          "type": "function"
        }],
        functionName: 'isApprovedForAll',
        args: [address, NFT_MULTI_SENDER_ADDRESS as `0x${string}`],
      });
      
      console.log('isApprovedForAll result:', isApprovedForAll);
      
      if (isApprovedForAll) {
        console.log('Collection already fully approved!');
        setIsApprovalNeeded(false);
        // If global approval is set, all tokens are effectively approved
        const tokenIds = recipients.map(r => r.tokenId);
        setApprovedTokenIds(new Set(tokenIds));
        
        // Track this collection as approved
        setApprovedCollections(prev => {
          const newSet = new Set(prev);
          newSet.add(nftContractAddress.toLowerCase());
          return newSet;
        });
      } else {
        console.log('Collection not approved yet, approval needed');
        setIsApprovalNeeded(true);
        setApprovedTokenIds(new Set());
      }
    } catch (err) {
      console.error('Error checking approval status:', err);
      setError(`Error checking approval status: ${err instanceof Error ? err.message : 'Unknown error'}`);
      // If we can't determine approval status, assume approval is needed to be safe
      setIsApprovalNeeded(true);
    }
  };
  
  // Always check approval status when contract changes
  useEffect(() => {
    // Reset approval state when contract changes
    if (nftContractAddress) {
      console.log('NFT contract changed, checking approval status for:', nftContractAddress);
      
      // If we already know this collection is approved, use that info
      if (isConnected && approvedCollections.has(nftContractAddress.toLowerCase())) {
        console.log('Collection already known to be approved:', nftContractAddress);
        setIsApprovalNeeded(false);
        
        // Set token IDs as approved
        const tokenIds = recipients.map(r => r.tokenId);
        setApprovedTokenIds(new Set(tokenIds));
      } else {
        // Otherwise mark as approval needed
        console.log('New collection or not approved yet, checking status');
        setIsApprovalNeeded(true);
        setApprovedTokenIds(new Set());
        
        // And check actual status if connected
        if (isConnected && address && publicClient) {
          checkApprovalStatus();
        }
      }
    }
  }, [isConnected, address, nftContractAddress, publicClient, approvedCollections, recipients]);
  
  // Approve NFT contract
  const { data: approvalHash, writeContract: approveNFT, isPending: isApproving, error: approvalError } = useWriteContract();
  
  // Handle approval errors
  useEffect(() => {
    if (approvalError) {
      console.error('Approval transaction error:', approvalError);
      setError(`Approval failed: ${approvalError.message || 'Transaction failed'}`);
    }
  }, [approvalError]);
  
  // Wait for approval transaction
  const { isLoading: isWaitingForApproval, status: approvalStatus } = useWaitForTransactionReceipt({
    hash: approvalHash,
    query: {
      enabled: !!approvalHash,
    }
  });

  // Update approval status after transaction completes
  useEffect(() => {
    if (approvalHash && approvalStatus) {
      console.log('Approval transaction status:', approvalStatus);
      
      if (approvalStatus === 'success') {
        console.log('Approval transaction successful!');
        setIsApprovalPending(false);
        setIsApprovalNeeded(false); // Update UI to show approval is no longer needed
        
        // Since we used setApprovalForAll, all tokens are now approved
        const allTokenIds = recipients.map(r => r.tokenId);
        setApprovedTokenIds(new Set(allTokenIds));
        
        // CRITICAL: Save this collection as approved in our tracking state
        if (nftContractAddress) {
          setApprovedCollections(prev => {
            console.log('Adding collection to approved list:', nftContractAddress);
            const newSet = new Set(prev);
            newSet.add(nftContractAddress.toLowerCase());
            return newSet;
          });
          
          // After approval is successful, we can enable random token IDs
          // but only call fetchOwnedTokenIds if the toggle is on
          if (useRandomTokenIds) {
            setSuccess('NFT contract approved! Fetching your owned token IDs...');
            // Actually fetch the token IDs
            fetchOwnedTokenIds();
          }
        }
        
        // Clear any errors from previous failed approvals
        setError('');
      } else if (approvalStatus === 'error') {
        console.error('Approval transaction failed with status:', approvalStatus);
        setIsApprovalPending(false);
        setError(`Approval transaction failed. Please try again.`);
      }
    }
  }, [approvalHash, approvalStatus, recipients, nftContractAddress]);
  
  // Loading state for token ID fetching
  const [isFetchingTokenIds, setIsFetchingTokenIds] = useState(false);
  
  // Function to fetch token IDs owned by the current wallet address for the selected NFT contract
  const fetchOwnedTokenIds = async () => {
    if (!nftContractAddress || !isConnected || !address || !publicClient) {
      console.log('Missing required parameters to fetch owned tokens');
      return;
    }
    
    try {
      console.log('Fetching owned token IDs for contract:', nftContractAddress);
      setSuccess(null);
      setIsFetchingTokenIds(true); // Set loading state
      
      // ERC-721 balanceOf query
      const balance = await publicClient.readContract({
        address: nftContractAddress as `0x${string}`,
        abi: [{
          "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
          "name": "balanceOf",
          "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
          "stateMutability": "view",
          "type": "function"
        }],
        functionName: 'balanceOf',
        args: [address],
      });
      
      console.log('NFT balance:', balance);
      
      // If no tokens are owned, return
      if (Number(balance) === 0) {
        console.log('No tokens owned for this contract');
        setError('You do not own any tokens for this NFT contract');
        setOwnedTokenIds([]);
        return;
      }

      // Get token IDs owned by the user
      // For ERC-721 contracts that support the enumeration extension
      let ownedIds: string[] = [];
      
      try {
        // Try with tokenOfOwnerByIndex which is part of the ERC-721 enumerable extension
        for (let i = 0; i < Number(balance); i++) {
          try {
            const tokenId = await publicClient.readContract({
              address: nftContractAddress as `0x${string}`,
              abi: [{
                "inputs": [
                  { "internalType": "address", "name": "owner", "type": "address" },
                  { "internalType": "uint256", "name": "index", "type": "uint256" }
                ],
                "name": "tokenOfOwnerByIndex",
                "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                "stateMutability": "view",
                "type": "function"
              }],
              functionName: 'tokenOfOwnerByIndex',
              args: [address, BigInt(i)],
            });
            
            ownedIds.push(tokenId.toString());
          } catch (err) {
            // Contract might not support tokenOfOwnerByIndex
            console.error('Error fetching token by index:', err);
            break;
          }
        }
      } catch (err) {
        console.log('Contract does not support enumeration extension, cannot fetch tokens');
      }
      
      if (ownedIds.length === 0) {
        // Fallback to Reservoir API if enumeration extension is not supported
        console.log('Trying Reservoir API to fetch token IDs');
        try {
          const reservoirUrl = new URL(`${import.meta.env.VITE_RESERVOIR_API_URL}/users/${address}/tokens/v7`);
          reservoirUrl.searchParams.append('limit', '100');
          reservoirUrl.searchParams.append('chainId', '8453'); // Base chain ID
          reservoirUrl.searchParams.append('contract', nftContractAddress);
          
          const response = await fetch(reservoirUrl.toString(), {
            headers: {
              'accept': '*/*',
              'x-api-key': import.meta.env.VITE_RESERVOIR_API_KEY
            }
          });
          
          if (!response.ok) {
            throw new Error(`Reservoir API responded with status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.tokens && data.tokens.length > 0) {
            console.log('Found tokens using Reservoir API:', data.tokens);
            ownedIds = data.tokens.map((token: {token: {tokenId: string}}) => token.token.tokenId);
          }
        } catch (reservoirError) {
          console.error('Reservoir API fallback failed:', reservoirError);
        }
      }
      
      if (ownedIds.length > 0) {
        console.log('Found owned token IDs:', ownedIds);
        setOwnedTokenIds(ownedIds);
        setSuccess(`Found ${ownedIds.length} tokens owned by you for this contract`);
        
        // Automatically assign random token IDs if toggle is on
        if (useRandomTokenIds) {
          assignRandomTokenIds(ownedIds);
        }
      } else {
        setError('Unable to fetch owned token IDs. Contract might not support the required functions.');
      }
    } catch (err) {
      console.error('Error fetching owned tokens:', err);
      setError(`Error fetching owned tokens: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setOwnedTokenIds([]);
    } finally {
      setIsFetchingTokenIds(false); // Clear loading state
    }
  };

  // Function to assign random token IDs from the owned tokens
  const assignRandomTokenIds = (tokenIdsToUse = ownedTokenIds) => {
    if (tokenIdsToUse.length === 0) {
      setError('No owned token IDs available to assign');
      return;
    }
    
    console.log('Assigning random token IDs from pool:', tokenIdsToUse);
    
    // Create a copy of recipients to modify
    const newRecipients = [...recipients];
    
    // Create a copy of available token IDs that we can remove from as we assign
    let availableTokenIds = [...tokenIdsToUse];
    
    // Assign token IDs to each recipient
    newRecipients.forEach((_, index) => {
      // If we still have token IDs available to assign
      if (availableTokenIds.length > 0) {
        // Choose a random token ID from our available pool
        const randomIndex = Math.floor(Math.random() * availableTokenIds.length);
        newRecipients[index] = { 
          ...newRecipients[index],
          tokenId: availableTokenIds[randomIndex]
        };
        
        // Remove the assigned token ID from the pool to avoid duplicates
        availableTokenIds.splice(randomIndex, 1);
      }
    });
    
    setRecipients(newRecipients);
    setSuccess(`Randomly assigned token IDs to ${Math.min(recipients.length, tokenIdsToUse.length)} recipients`);
  };
  
  // Send multiple NFTs
  const { data: sendHash, writeContract: sendNFTs, isPending: isSending, error: sendError } = useWriteContract();
  
  // Handle send errors with detailed diagnostics
  useEffect(() => {
    if (sendError) {
      console.error('Send transaction error:', sendError);
      
      // Provide more detailed error information
      let errorMessage = `Transaction failed: ${sendError.message || 'Unknown error'}`;
      
      // Extract specific blockchain error patterns
      if (sendError.message) {
        const message = sendError.message.toLowerCase();
        
        if (message.includes('execution reverted')) {
          // Try to extract the specific revert reason if available
          const revertMatch = sendError.message.match(/reverted with reason string '(.+)'/i);
          if (revertMatch && revertMatch[1]) {
            errorMessage = `Transaction reverted: ${revertMatch[1]}`;
          } else {
            errorMessage = 'Transaction reverted on-chain. The NFT contract may have transfer restrictions.';
          }
        } else if (message.includes('gas')) {
          errorMessage = 'Transaction failed due to gas issues. Try increasing the gas limit or simplifying the transaction.';
        } else if (message.includes('nonce')) {
          errorMessage = 'Transaction nonce issue. Please refresh the page and try again.';
        } else if (message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected in your wallet.';
        } else if (message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds to cover the transaction gas fees.';
        } else if (message.includes('owner')) {
          errorMessage = 'Ownership verification failed. You may no longer own one of these NFTs.';
        }
        
        // Log the full error details for debugging
        console.log('Detailed error information:', sendError);
      }
      
      setError(errorMessage);
    }
  }, [sendError]);
  
  // Wait for send transaction completion
  const { isLoading: isWaitingForSend, status: sendStatus } = useWaitForTransactionReceipt({
    hash: sendHash,
    query: {
      enabled: !!sendHash,
    }
  });
  
  // Handle send transaction completion
  useEffect(() => {
    if (sendHash && sendStatus) {
      console.log('Send transaction status:', sendStatus);
      
      if (sendStatus === 'success') {
        console.log('Send transaction successful!');
        setSuccess('NFTs sent successfully! Select a new NFT collection for the next batch.');
        setError(null); // Clear any previous errors
        setTxHash(sendHash); // Store the transaction hash for display
        
        // Complete reset of component state to allow a new batch
        setRecipients([{ address: '', tokenId: '' }]);
        setNftContractAddress(''); // Clear NFT contract address to force new selection
        setIsApprovalNeeded(true); // Reset approval status
        setApprovedTokenIds(new Set()); // Clear approved tokens
      } else if (sendStatus === 'error') {
        console.error('Send transaction failed with status:', sendStatus);
        setError('Transaction failed or was reverted on-chain. This may happen if you no longer own the NFTs or the contract rejected the transfer.');
      }
    }
  }, [sendHash, sendStatus]);
  
  // Handle changes to preSelectedNFTs
  useEffect(() => {
    if (preSelectedNFTs && preSelectedNFTs.length > 0) {
      const contractAddress = preSelectedNFTs[0].contractAddress;
      setNftContractAddress(contractAddress);
      setRecipients(preSelectedNFTs[0].tokenIds.map(tokenId => ({ address: '', tokenId })));
      
      // Reset any error state when pre-selected NFTs change
      setError(null);
      
      // Reset approval state
      setIsApprovalNeeded(true);
      setApprovedTokenIds(new Set<string>());
    }
  }, [preSelectedNFTs]);
  
  // Add more recipients
  const addRecipient = () => {
    setRecipients([...recipients, { address: '', tokenId: '' }]);
  };
  
  // Remove recipient
  const removeRecipient = (index: number) => {
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
  };
  
  // Update recipient details
  const updateRecipient = (index: number, field: 'address' | 'tokenId', value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index][field] = value;
    setRecipients(newRecipients);
  };

  // Parse CSV file with wallet addresses
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    console.log('CSV file selected:', file.name);
    setError(null); // Clear any previous errors
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const validAddresses: string[] = [];
        
        // Process each line to extract valid EVM addresses
        lines.forEach(line => {
          // Clean up the line and look for EVM address pattern
          const trimmedLine = line.trim();
          // Check if the line contains a valid Ethereum address (0x followed by 40 hex characters)
          const addressMatch = trimmedLine.match(/0x[a-fA-F0-9]{40}/);
          if (addressMatch) {
            validAddresses.push(addressMatch[0]);
          }
        });

        if (validAddresses.length > 0) {
          // Create new recipients array that preserves existing token IDs
          const newRecipients = [];
          
          // First, use existing recipients and update their addresses
          for (let i = 0; i < Math.min(recipients.length, validAddresses.length); i++) {
            newRecipients.push({
              address: validAddresses[i],
              tokenId: recipients[i].tokenId // Preserve existing token ID
            });
          }
          
          // Add any remaining addresses as new recipients
          if (validAddresses.length > recipients.length) {
            for (let i = recipients.length; i < validAddresses.length; i++) {
              newRecipients.push({
                address: validAddresses[i],
                tokenId: '' // New recipients get empty token ID
              });
            }
          }
          
          setRecipients(newRecipients);
          setSuccess(`Successfully imported ${validAddresses.length} wallet addresses`);
          
          // If random token IDs should be assigned, fetch them now
          if (useRandomTokenIds) {
            fetchOwnedTokenIds();
          }
        } else {
          setError('No valid Ethereum addresses found in the CSV file');
        }
      } catch (err) {
        console.error('Error parsing CSV:', err);
        setError(`Failed to parse CSV file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      setError('Error reading the CSV file. Please try again with a different file.');
    };
    
    // Start reading the file as text
    console.log('Starting to read CSV file...');
    reader.readAsText(file);
  };
  
  // Function to handle NFT approval
  const handleApprove = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (chainId !== base.id) {
      setError('Please switch to Base mainnet first');
      return;
    }
    
    if (!nftContractAddress) {
      setError('Please enter a valid NFT contract address');
      return;
    }
    
    // Save the contract address we're approving for reference
    const contractBeingApproved = nftContractAddress;
    console.log('Approving contract:', contractBeingApproved);
    
    setIsApprovalPending(true);
    
    try {
      // Approve all tokens from this NFT contract for the MultiSender contract
      approveNFT({
        address: contractBeingApproved as `0x${string}`,
        abi: [{
          "inputs": [
            { "internalType": "address", "name": "operator", "type": "address" },
            { "internalType": "bool", "name": "approved", "type": "bool" }
          ],
          "name": "setApprovalForAll",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }],
        functionName: 'setApprovalForAll',
        args: [NFT_MULTI_SENDER_ADDRESS as `0x${string}`, true],
      });
      
      console.log('Approval transaction sent for contract:', contractBeingApproved);
    } catch (err) {
      console.error('Failed to approve:', err);
      setError(`Failed to approve: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsApprovalPending(false);
    }
  };

  // Function to verify NFT ownership using OpenZeppelin's approach with multicall pattern
  const verifyNFTOwnership = async (tokenIds: bigint[]): Promise<boolean> => {
    setError(null);
    
    if (!publicClient || !nftContractAddress || !address) {
      setError('Unable to verify ownership: Missing client, contract, or wallet connection');
      return false;
    }
    
    try {
      console.log(`Verifying ownership of ${tokenIds.length} NFTs using OpenZeppelin approach with batched calls...`, tokenIds);
      
      // Set loading state during verification
      setSuccess(`Verifying ownership of ${tokenIds.length} NFTs...`);
      
      // Define OpenZeppelin compatible ERC721 ABI
      // Based directly on OpenZeppelin's implementation
      const erc721ABI = [
        // ownerOf function - following OpenZeppelin standard
        {
          "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
          "name": "ownerOf",
          "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
          "stateMutability": "view",
          "type": "function"
        },
        // supportsInterface - to verify it's an ERC721 contract
        {
          "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }],
          "name": "supportsInterface",
          "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      
      // First verify this is an ERC721 contract by checking interface support
      // ERC721 interface ID: 0x80ac58cd
      try {
        const isERC721 = await publicClient.readContract({
          address: nftContractAddress as `0x${string}`,
          abi: erc721ABI,
          functionName: 'supportsInterface',
          args: ['0x80ac58cd']
        });
        
        if (!isERC721) {
          setError(`The contract at ${nftContractAddress} does not support the ERC721 standard. Please verify the contract address.`);
          setSuccess(null);
          return false;
        }
        console.log(`✅ Verified contract implements ERC721 interface`);
      } catch (error) {
        console.warn(`Could not verify ERC721 interface, proceeding anyway:`, error);
        // Continue anyway as some contracts don't implement supportsInterface correctly
      }
      
      // Define the batch size to avoid rate limits
      const BATCH_SIZE = 5;
      
      // Process tokenIds in batches to avoid rate limiting
      for (let i = 0; i < tokenIds.length; i += BATCH_SIZE) {
        // Update progress
        setSuccess(`Verifying NFTs ${i+1} to ${Math.min(i+BATCH_SIZE, tokenIds.length)} of ${tokenIds.length}...`);
        
        // Create a batch of tokens to process
        const batchTokenIds = tokenIds.slice(i, i + BATCH_SIZE);
        
        try {
          // Create multicall contract calls for the current batch
          const calls = batchTokenIds.map(tokenId => ({
            address: nftContractAddress as `0x${string}`,
            abi: erc721ABI as any, // Type assertion to fix TypeScript error
            functionName: 'ownerOf',
            args: [tokenId]
          }));

          // Log batch details
          console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1}: Verifying tokens:`, 
                     batchTokenIds.map(id => `${id.toString()} (decimal), 0x${id.toString(16)} (hex)`));
          
          // Use the multicall feature to batch the requests into a single RPC call
          const results = await publicClient.multicall({
            contracts: calls as any, // Type assertion to fix TypeScript error
            allowFailure: true
          });
          
          // Process each result in the batch - following OpenZeppelin's approach
          for (let j = 0; j < results.length; j++) {
            const result = results[j];
            const tokenId = batchTokenIds[j];
            
            if (result.status === 'failure') {
              // Handle failure for this specific token
              console.error(`Error checking token ${tokenId.toString()}:`, result.error);
              const errorMessage = result.error?.message || 'Unknown error';
              
              // Handle OpenZeppelin specific error messages
              if (errorMessage.includes('ERC721NonexistentToken') || 
                  errorMessage.includes('nonexistent token') || 
                  errorMessage.includes('owner query for nonexistent token')) {
                setError(`NFT #${tokenId.toString()} doesn't exist on this contract (ERC721NonexistentToken). This may be due to token ID format mismatch.`);
              } else if (errorMessage.includes('invalid token ID')) {
                setError(`Invalid token ID format: #${tokenId.toString()}. Please check that the token ID format is correct.`);
              } else {
                setError(`Failed to verify ownership of NFT #${tokenId.toString()}. Error: ${errorMessage}`);
              }
              
              setSuccess(null);
              return false;
            } 
            
            // Check if current wallet is the owner (OpenZeppelin requires exact case match)
            // but we'll keep our case-insensitive check to be safer
            const owner = result.result as string;
            if (owner.toLowerCase() !== address.toLowerCase()) {
              setError(`Failed to verify ownership of NFT #${tokenId.toString()}. Current owner is ${owner}`);
              setSuccess(null);
              return false;
            }
            
            console.log(`✅ Verified: Token ID ${tokenId.toString()} is owned by ${address}`);
          }
          
          // Add a small delay between batches to further reduce rate limiting issues
          if (i + BATCH_SIZE < tokenIds.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error: any) {
          console.error(`Error during batch verification:`, error);
          setError(`Batch verification failed: ${error.message || 'Unknown error'}. Try sending fewer NFTs at once.`);
          setSuccess(null);
          return false;
        }
      }
      
      console.log('✅ All NFTs verified as owned by the connected wallet');
      setSuccess(`All ${tokenIds.length} NFTs verified as owned by your wallet`);
      return true;
    } catch (error: any) {
      console.error('Error during ownership verification:', error);
      setError(`Ownership verification failed: ${error.message || 'Unknown error'}`);
      setSuccess(null);
      return false;
    }
  };

  // Function to handle NFT sending
  const handleSendNFTs = async () => {
    if (!nftContractAddress || !isConnected || recipients.length === 0) {
      setError('Please connect your wallet, enter an NFT contract address, and add at least one recipient');
      return;
    }
    
    // Set initial status
    setSuccess('Preparing to send NFTs...');
    
    try {
      // Check if we're on a supported network
      const chainId = chain?.id;
      console.log(`Current chain ID: ${chainId}`);
      
      // Check wallet balance for gas fees (rough estimate)
      if (publicClient) {
        const balance = await publicClient.getBalance({ address: address as `0x${string}` });
        console.log(`Wallet balance: ${formatEther(balance)} ${chain?.nativeCurrency.symbol || 'ETH'}`);
        
        // Warning if balance seems low (rough estimate, not exact)
        if (balance < parseEther('0.005')) {
          console.warn(`Low wallet balance detected. You may need more funds for gas fees.`);
          setError(`Warning: Your wallet balance is low. You may not have enough funds for gas fees.`);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking prerequisites:', error);
      // Continue anyway as this is just a helpful check
    }
    
    // Validate all inputs
    const allValid = recipients.every(r => 
      r.address && r.address.startsWith('0x') && r.tokenId && !isNaN(Number(r.tokenId))
    );
    
    if (!allValid) {
      setError('Please ensure all recipient addresses and token IDs are valid');
      return;
    }
    
    try {
      // Format addresses and token IDs correctly
      const recipientAddresses = recipients.map(r => {
        try {
          return r.address as `0x${string}`;
        } catch (e) {
          throw new Error(`Invalid address format for recipient: ${r.address}`);
        }
      });
      
      const tokenIds = recipients.map(r => {
        try {
          // Normalize token ID format to handle different string representations
          let tokenIdStr = r.tokenId.trim();
          
          // Handle hexadecimal format with '0x' prefix
          if (tokenIdStr.toLowerCase().startsWith('0x')) {
            return BigInt(tokenIdStr);
          }
          
          // Handle decimal format
          return BigInt(tokenIdStr);
        } catch (e) {
          throw new Error(`Invalid token ID format: ${r.tokenId}`);
        }
      });
      
      console.log('Normalized token IDs for sending:', tokenIds.map(id => id.toString()));
      
      // First verify ownership of all NFTs to prevent contract revert
      const ownershipVerified = await verifyNFTOwnership(tokenIds);
      
      if (ownershipVerified === false || ownershipVerified === undefined) {
        return; // Error is already set by the verification function
      }
      
      console.log('Sending NFTs:', {
        contract: nftContractAddress,
        multiSender: NFT_MULTI_SENDER_ADDRESS,
        recipients: recipientAddresses,
        tokenIds: tokenIds
      });
      
      // Double check approval status before sending
      const isCollectionApproved = approvedCollections.has(nftContractAddress.toLowerCase());
      console.log('Is collection approved before sending?', isCollectionApproved, nftContractAddress.toLowerCase());
      console.log('Approved collections:', Array.from(approvedCollections));
      
      if (isCollectionApproved === false || isCollectionApproved === undefined) {
        setError('Please approve the NFTs for transfer first by clicking the Approve button');
        return;
      }
      
      console.log('Preparing transaction with params:', {
        contract: NFT_MULTI_SENDER_ADDRESS,
        nftContract: nftContractAddress,
        recipients: recipientAddresses,
        tokenIds: tokenIds.map(id => id.toString()),
      });

      // Send the transaction with optimized parameters and explicit gas settings
      sendNFTs({
        address: NFT_MULTI_SENDER_ADDRESS as `0x${string}`,
        abi: NFTMultiSenderABI,
        functionName: 'multisendNFT',
        args: [nftContractAddress as `0x${string}`, recipientAddresses, tokenIds],
        account: address, // Explicitly set the sender account
        gas: BigInt(2000000), // Doubled gas limit to ensure transaction doesn't run out of gas
      });
    } catch (err) {
      console.error('Failed to send NFTs:', err);
      setError(`Failed to send NFTs: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Loading states
  const isLoading = isApproving || isWaitingForApproval || isSending || isWaitingForSend;
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">NFT MultiSender</h1>
      
      {!isConnected ? (
        <div className="p-4 mb-4 bg-yellow-100 text-yellow-800 rounded-md">
          Connect your wallet to use this feature
        </div>
      ) : chainId !== base.id ? (
        <div className="p-4 mb-4 bg-yellow-100 text-yellow-800 rounded-md flex justify-between items-center">
          <span>Please switch to Base mainnet</span>
          <button 
            onClick={handleSwitchNetwork}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Switch to Base
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* NFT Contract Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NFT Contract Address
            </label>
            <input
              type="text"
              value={nftContractAddress}
              onChange={(e) => setNftContractAddress(e.target.value)}
              placeholder="0x..."
              className={`w-full p-3 rounded-xl transition-all duration-200 focus:scale-[1.02] ${theme === 'cream' 
                ? 'bg-cream-50 border border-bronze-200 focus:ring-bronze-400 focus:border-bronze-400 text-bronze-800 placeholder-bronze-300' 
                : 'bg-baseBlack-800 border border-baseBlack-600 focus:ring-baseBlue-500 focus:border-baseBlue-500 text-baseBlue-100 placeholder-baseBlack-500'}`}
            />
          </div>
          
          {/* Approval Status and Button */}
          {nftContractAddress && (
            <div className={`p-4 rounded-xl transition-all duration-300 animate-fade-in ${theme === 'cream' ? 'bg-cream-100' : 'bg-baseBlack-700'}`}>
              <div className="flex items-center justify-between">
                <span>
                  {isApprovalNeeded 
                    ? "NFT contract needs approval" 
                    : "NFT contract is approved"}
                </span>
                {isApprovalNeeded && (
                  <button
                    onClick={handleApprove}
                    disabled={isLoading || isApprovalPending}
                    className={`px-5 py-2.5 rounded-2xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-subtle ${theme === 'cream' 
                      ? 'bg-bronze-500 text-cream-50 hover:bg-bronze-600 disabled:bg-bronze-300' 
                      : 'bg-baseBlue-600 text-white hover:bg-baseBlue-700 disabled:bg-baseBlack-600'}`}
                  >
                    {isApproving || isWaitingForApproval || isApprovalPending ? "Approving..." : "Approve"}
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Recipients */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className={`font-medium ${theme === 'cream' ? 'text-bronze-800' : 'text-baseBlue-100'}`}>Recipients</h3>
              <div className="flex gap-2">
                {/* CSV Upload Button */}
                <label
                  className={`flex items-center px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${theme === 'cream' 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  <input
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={handleCSVUpload}
                  />
                  Import CSV
                </label>
                <button
                  onClick={addRecipient}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${theme === 'cream' 
                    ? 'bg-bronze-500 hover:bg-bronze-600 text-cream-50' 
                    : 'bg-baseBlue-600 hover:bg-baseBlue-700 text-white'}`}
                >
                  + Add Recipient
                </button>
              </div>
            </div>
            
            {/* Random Token ID Toggle - Only show in Normal Mode (when no preSelectedNFTs) */}
            {!preSelectedNFTs && (
              <div className="flex items-center mb-4 gap-2">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={useRandomTokenIds}
                      onChange={() => {
                        const newState = !useRandomTokenIds;
                        setUseRandomTokenIds(newState);
                        
                        // When toggle is turned on and we're already approved, fetch owned tokens
                        if (newState && nftContractAddress && isApprovalNeeded === false && approvedCollections.has(nftContractAddress.toLowerCase())) {
                          fetchOwnedTokenIds();
                        } else if (!newState) {
                          // When turning off, clear success messages
                          setSuccess(null);
                        }
                      }}
                    />
                    <div className={`w-10 h-5 ${useRandomTokenIds ? theme === 'cream' ? 'bg-bronze-500' : 'bg-baseBlue-600' : 'bg-gray-300'} rounded-full shadow-inner`}></div>
                    <div className={`absolute left-0 top-0 w-5 h-5 bg-white rounded-full transition transform ${useRandomTokenIds ? 'translate-x-5' : ''}`}></div>
                  </div>
                  <span className={`ml-2 text-sm ${theme === 'cream' ? 'text-bronze-800' : 'text-baseBlue-100'}`}>
                    Use Random Token IDs
                  </span>
                </label>
                {useRandomTokenIds && (
                  isFetchingTokenIds ? (
                    <div className={`ml-2 flex items-center ${theme === 'cream' ? 'text-bronze-600' : 'text-baseBlue-400'}`}>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
                      <span className="text-xs">Fetching tokens...</span>
                    </div>
                  ) : ownedTokenIds.length === 0 ? (
                    <button 
                      onClick={fetchOwnedTokenIds}
                      disabled={!nftContractAddress || !isConnected || isLoading}
                      className={`ml-2 px-3 py-1 rounded-lg text-xs transition-all duration-300 ${theme === 'cream' 
                        ? 'bg-bronze-500 hover:bg-bronze-600 text-white' 
                        : 'bg-baseBlue-600 hover:bg-baseBlue-700 text-white'}`}>
                      Fetch Token IDs
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        if (ownedTokenIds.length > 0) {
                          assignRandomTokenIds();
                        }
                      }}
                      className={`ml-2 px-3 py-1 rounded-lg text-xs transition-all duration-300 ${theme === 'cream' 
                        ? 'bg-bronze-500 hover:bg-bronze-600 text-white' 
                        : 'bg-baseBlue-600 hover:bg-baseBlue-700 text-white'}`}>
                      Re-randomize
                    </button>
                  )
                )}
              </div>
            )}
            
            {recipients.map((recipient, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={recipient.address}
                  onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                  placeholder="Recipient Address"
                  className={`flex-1 p-2.5 rounded-xl transition-all duration-200 ${theme === 'cream' 
                    ? 'bg-cream-50 border border-bronze-200 focus:ring-bronze-400 focus:border-bronze-400 text-bronze-800 placeholder-bronze-300' 
                    : 'bg-baseBlack-800 border border-baseBlack-600 focus:ring-baseBlue-500 focus:border-baseBlue-500 text-baseBlue-100 placeholder-baseBlack-500'}`}
                />
                <input
                  type="text"
                  value={recipient.tokenId}
                  onChange={(e) => updateRecipient(index, 'tokenId', e.target.value)}
                  placeholder="Token ID"
                  className={`w-24 p-2.5 rounded-xl transition-all duration-200 ${theme === 'cream' 
                    ? 'bg-cream-50 border border-bronze-200 focus:ring-bronze-400 focus:border-bronze-400 text-bronze-800 placeholder-bronze-300' 
                    : 'bg-baseBlack-800 border border-baseBlack-600 focus:ring-baseBlue-500 focus:border-baseBlue-500 text-baseBlue-100 placeholder-baseBlack-500'}`}
                />
                {recipients.length > 1 && (
                  <button
                    onClick={() => removeRecipient(index)}
                    className={`text-white px-3 py-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${theme === 'cream' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div>
            <button
              onClick={handleSendNFTs}
              disabled={isLoading || isApprovalNeeded}
              className={`w-full py-3 rounded-2xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed ${theme === 'cream' 
                ? 'bg-bronze-500 text-cream-50 hover:bg-bronze-600 disabled:bg-bronze-300' 
                : 'bg-baseBlue-600 text-white hover:bg-baseBlue-700 disabled:bg-baseBlack-600'}`}
            >
              {isSending || isWaitingForSend 
                ? "Sending NFTs..."
                : "Send NFTs"}
            </button>
          </div>
          
          {/* Approval Status */}
          {isApprovalNeeded && !isLoading && (
            <div className="mt-2">
              <div className={`text-sm mb-1 ${theme === 'cream' ? 'text-bronze-700' : 'text-baseBlue-300'}`}>
                Approval status:
              </div>
              <div className="grid grid-cols-1 gap-2 mt-1">
                {recipients
                  .filter(r => r.tokenId !== undefined && r.tokenId !== null && r.tokenId.trim() !== '')
                  .map((recipient, idx) => (
                    <div key={`approval-${idx}`} className="flex items-center">
                      <div className={`text-xs ${approvedTokenIds.has(recipient.tokenId) 
                        ? (theme === 'cream' ? 'text-green-600' : 'text-green-400')
                        : (theme === 'cream' ? 'text-red-600' : 'text-red-400')}`}
                      >
                        Token #{recipient.tokenId}: {approvedTokenIds.has(recipient.tokenId) ? 'Approved' : 'Needs approval'}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className={`p-4 rounded-xl animate-fade-in ${theme === 'cream' ? 'bg-red-100 text-red-800' : 'bg-red-900/30 text-red-300'}`}>
              {error}
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className={`p-4 rounded-xl animate-fade-in ${theme === 'cream' ? 'bg-green-100 text-green-800' : 'bg-green-900/30 text-green-300'}`}>
              {success}
            </div>
          )}
          
          {/* Transaction Hash */}
          {txHash && (
            <div className={`p-4 rounded-xl animate-fade-in animate-pulse-subtle ${theme === 'cream' ? 'bg-green-100 text-green-800' : 'bg-green-900/30 text-green-300'}`}>
              <p>Transaction successful!</p>
              <a 
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`hover:underline break-all transition-colors ${theme === 'cream' ? 'text-bronze-600 hover:text-bronze-800' : 'text-baseBlue-400 hover:text-baseBlue-300'}`}
              >
                {txHash}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NFTMultiSender;
