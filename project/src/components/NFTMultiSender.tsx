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
  
  // Track which collections have been approved (with reset capability)
  const [approvedCollections, setApprovedCollections] = useState<Set<string>>(new Set());
  
  // Get public client from wagmi for contract reads
  const publicClient = usePublicClient();
  
  // Function to clear approval cache when switching contracts or when users experience stuck states
  const clearApprovalCache = () => {
    console.log('🔄 Clearing approval cache for fresh start...');
    setApprovedCollections(new Set());
    setIsApprovalNeeded(true);
    setApprovedTokenIds(new Set());
    setError(null);
    setSuccess(null); // Clear success message completely
    setTxHash(null); // Clear any previous transaction hash
    
    // Automatically re-check approval status after clearing cache
    if (nftContractAddress && isConnected && address && publicClient) {
      setTimeout(() => {
        console.log('🔍 Auto-rechecking approval status after cache clear...');
        checkApprovalStatus();
      }, 500); // Small delay to ensure state is updated
    }
  };
  
  // Complete reset function - clears everything for fresh start
  const resetAllData = () => {
    console.log('🔄 Complete reset - clearing all data for fresh start...');
    
    // Clear approval cache
    setApprovedCollections(new Set());
    setIsApprovalNeeded(true);
    setApprovedTokenIds(new Set());
    
    // Clear recipients (but keep at least one empty row)
    setRecipients([{ address: '', tokenId: '' }]);
    
    // Clear owned token IDs and random toggle
    setOwnedTokenIds([]);
    setUseRandomTokenIds(false);
    
    // Clear all messages
    setError(null);
    setSuccess(null);
    setTxHash(null);
    
    // Clear loading states
    setIsFetchingTokenIds(false);
    setIsApprovalPending(false);
    
    console.log('Complete reset finished - ready for new NFT selection');
  };

  // Enhanced automatic cache clearing with complete reset when contract changes
  useEffect(() => {
    if (nftContractAddress) {
      console.log('🔄 NFT contract changed to:', nftContractAddress);
      
      // Automatically do a complete reset when contract changes
      // This ensures fresh data and no stuck states
      resetAllData();
      
      // Then check approval status if connected
      if (isConnected && address && publicClient) {
        setTimeout(() => {
          console.log('🔍 Auto-checking approval status for new contract...');
          checkApprovalStatus();
        }, 800); // Slightly longer delay to ensure reset is complete
      }
    }
  }, [nftContractAddress]);

  // Enhanced automatic cache clearing - detects when cache should be cleared
  useEffect(() => {
    // Auto-clear cache when wallet changes (different approvals per wallet)
    if (address && nftContractAddress) {
      console.log('🔄 Wallet changed, auto-clearing approval cache...');
      clearApprovalCache();
    }
  }, [address]);

  // Smart cache clearing when recipients change significantly
  useEffect(() => {
    // If user has changed recipients significantly and we have cached approvals,
    // auto-clear cache to ensure fresh approval checking
    if (recipients.length > 0 && nftContractAddress && approvedCollections.size > 0) {
      const hasValidTokenIds = recipients.some(r => r.tokenId && r.tokenId.trim() !== '');
      if (hasValidTokenIds) {
        console.log('🔄 Recipients changed with valid token IDs, auto-clearing cache for fresh approval check...');
        clearApprovalCache();
      }
    }
  }, [recipients.length]); // Only trigger on recipient count changes
  
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
            setSuccess('Ownership verified! Checking approval...');
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
        // Note: Token fetching by enumeration is not supported by this contract
        // Users should enter token IDs manually or use Pro Mode to select specific NFTs
        console.log('Contract does not support token enumeration. Users should enter token IDs manually.');
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
        setError('Unable to fetch owned token IDs automatically. Please enter token IDs manually or turn off the Random Token IDs feature.');
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
  
  // Wait for send transaction completion with detailed receipt data
  const { data: sendReceipt, isLoading: isWaitingForSend, status: sendStatus } = useWaitForTransactionReceipt({
    hash: sendHash,
    query: {
      enabled: !!sendHash,
    }
  });
  
  // Handle send transaction completion with proper revert detection
  useEffect(() => {
    if (sendHash && sendStatus && sendReceipt) {
      console.log('Send transaction status:', sendStatus);
      console.log('Send transaction receipt:', sendReceipt);
      
      if (sendStatus === 'success') {
        // Check if the transaction actually succeeded (not reverted)
        // In EVM, status 1 = success, status 0 = revert
        if (sendReceipt.status === 'success') {
        console.log('Send transaction successful!');
        setSuccess('NFTs sent successfully! Select a new NFT collection for the next batch.');
        setError(null); // Clear any previous errors
        setTxHash(sendHash); // Store the transaction hash for display
        
        // Complete reset of component state to allow a new batch
        setRecipients([{ address: '', tokenId: '' }]);
        setNftContractAddress(''); // Clear NFT contract address to force new selection
        setIsApprovalNeeded(true); // Reset approval status
        setApprovedTokenIds(new Set()); // Clear approved tokens
        } else {
          // Transaction was mined but reverted during execution
          console.error('Transaction was mined but reverted during execution', sendReceipt);
          setSuccess(null);
          
          // Try to get more detailed error information from the receipt
          let detailedError = 'Transaction failed: The transaction was reverted on-chain. ';
          
          // Check for common revert reasons
          if (sendReceipt.logs && sendReceipt.logs.length === 0) {
            detailedError += 'No events were emitted, indicating a complete revert. Common causes: ';
            detailedError += '1) You don\'t own the NFTs, 2) NFTs are not approved for transfer, 3) Invalid token IDs, 4) Invalid recipient addresses.';
          } else {
            detailedError += 'Check the blockchain explorer for more details about the revert reason.';
          }
          
          setError(detailedError);
          
          // Also log the transaction hash for debugging
          console.error('Failed transaction hash:', sendHash);
          console.error('Receipt details:', {
            status: sendReceipt.status,
            gasUsed: sendReceipt.gasUsed,
            logs: sendReceipt.logs,
            transactionHash: sendReceipt.transactionHash
          });
        }
      } else if (sendStatus === 'error') {
        console.error('Send transaction failed with status:', sendStatus);
        setSuccess(null);
        setError('Transaction failed or was reverted on-chain. This may happen if you no longer own the NFTs or the contract rejected the transfer.');
      }
    }
  }, [sendHash, sendStatus, sendReceipt]);
  
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

  // COMPLETELY REWRITTEN FUNCTION TO ACTUALLY WORK
  const handleSendNFTs = async () => {
    if (!nftContractAddress || !isConnected || recipients.length === 0) {
      setError('Please connect your wallet, enter an NFT contract address, and add at least one recipient');
      return;
    }
    
    setSuccess('Starting NFT transfer process...');
    
    // Validate inputs first
    console.log('Validating inputs:', { recipients, nftContractAddress });
    
    const validRecipients = recipients.filter(r => r.address && r.tokenId);
    if (validRecipients.length !== recipients.length) {
      setError('Please ensure all recipient addresses and token IDs are filled');
          return;
    }
    
    // Validate addresses
    const invalidAddresses = recipients.filter(r => 
      !r.address || !r.address.startsWith('0x') || r.address.length !== 42
    );
    if (invalidAddresses.length > 0) {
      setError('Invalid recipient addresses found. All addresses must be valid Ethereum addresses starting with 0x');
      return;
    }
    
    // Validate token IDs
    const invalidTokenIds = recipients.filter(r => 
      !r.tokenId || (isNaN(Number(r.tokenId)) && !r.tokenId.startsWith('0x'))
    );
    if (invalidTokenIds.length > 0) {
      setError('Invalid token IDs found. Token IDs must be numbers or hex values');
      return;
    }
    
    // Check for duplicates
    const tokenIdStrings = recipients.map(r => r.tokenId);
    const uniqueTokenIds = new Set(tokenIdStrings);
    if (tokenIdStrings.length !== uniqueTokenIds.size) {
      setError('Duplicate token IDs found. Each NFT can only be sent once');
      return;
    }
    
    try {
      // Format addresses and token IDs
      const recipientAddresses = recipients.map(r => r.address as `0x${string}`);
      const tokenIds = recipients.map(r => {
          let tokenIdStr = r.tokenId.trim();
          if (tokenIdStr.toLowerCase().startsWith('0x')) {
            return BigInt(tokenIdStr);
          }
          return BigInt(tokenIdStr);
      });
      
      console.log('Formatted data:', {
        contract: nftContractAddress,
        recipients: recipientAddresses,
        tokenIds: tokenIds.map(id => id.toString()),
      });

      // STEP 1: Verify you actually own the first NFT
      setSuccess('🔍 Checking if you own the NFTs...');
      try {
        const firstTokenOwner = await publicClient!.readContract({
          address: nftContractAddress as `0x${string}`,
          abi: [{
            "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
            "name": "ownerOf",
            "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
            "stateMutability": "view",
            "type": "function"
          }],
          functionName: 'ownerOf',
          args: [tokenIds[0]]
        });
        
        console.log(`Token #${tokenIds[0]} owner:`, firstTokenOwner);
        console.log('Your address:', address);
        
        if (firstTokenOwner.toLowerCase() !== address!.toLowerCase()) {
          setError(`You don't own NFT #${tokenIds[0].toString()}!\nCurrent owner: ${firstTokenOwner}\nYour address: ${address}\n\nPlease check your token IDs are correct.`);
          return;
        }
        
        setSuccess('Ownership verified! Checking approval...');
      } catch (ownerError: any) {
        console.error('Ownership check failed:', ownerError);
        setError(`NFT #${tokenIds[0].toString()} doesn't exist or there's an error checking ownership.\n\nPlease verify:\n1. The contract address is correct\n2. The token ID exists\n3. You own this NFT`);
        return;
      }

      // STEP 2: Verify approval
      try {
        const isApproved = await publicClient!.readContract({
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
          args: [address as `0x${string}`, NFT_MULTI_SENDER_ADDRESS as `0x${string}`],
        });
        
        console.log('Approval status:', isApproved);
        
        if (!isApproved) {
          setError('NFTs are NOT approved for transfer!\n\nPlease:\n1. Click the "Approve" button\n2. Confirm the transaction in your wallet\n3. Wait for approval to complete\n4. Then try sending again');
        return;
      }
      
        setSuccess('Approval verified! Sending NFTs...');
      } catch (approvalError) {
        console.error('Approval check failed:', approvalError);
        setError('Cannot verify approval status. Please try clicking "Approve" again.');
        return;
      }

      // STEP 3: Send the transaction with the UNSAFE version (more likely to work)
      console.log('🚀 Sending transaction with multisendNFTUnsafe...');
      
      sendNFTs({
        address: NFT_MULTI_SENDER_ADDRESS as `0x${string}`,
        abi: NFTMultiSenderABI,
        functionName: 'multisendNFTUnsafe', // Using unsafe version for better compatibility
        args: [nftContractAddress as `0x${string}`, recipientAddresses, tokenIds],
        gas: BigInt(Math.max(500000 + (tokenIds.length * 200000), 4000000)), // Higher gas limit
      });

    } catch (err: any) {
      console.error('Failed to send NFTs:', err);
      setError(`Failed to send NFTs: ${err.message || 'Unknown error'}\n\nPlease check:\n1. You own all the NFTs\n2. Token IDs are correct\n3. Recipient addresses are valid`);
    }
  };

  // Smart automatic cache clearing when transaction fails due to approval issues
  useEffect(() => {
    // If send transaction fails and we think we're approved, auto-clear cache and recheck
    if (sendError && !isApprovalNeeded && nftContractAddress) {
      const errorMessage = sendError.message || '';
      // Check if error is related to approval/ownership issues
      if (errorMessage.includes('not approved') || 
          errorMessage.includes('not owner') || 
          errorMessage.includes('transfer caller is not owner') ||
          errorMessage.includes('ERC721: transfer from incorrect owner')) {
        console.log('🔄 Send failed due to approval/ownership - auto-clearing cache...');
        clearApprovalCache();
      }
    }
  }, [sendError, isApprovalNeeded, nftContractAddress]);

  // Auto-clear cache after successful sends to prepare for next batch
  useEffect(() => {
    if (txHash && sendStatus === 'success') {
      console.log('🔄 Send successful - auto-preparing for next batch...');
      // Small delay then auto-reset for next batch
      setTimeout(() => {
        resetAllData();
      }, 2000); // Give user time to see success message
    }
  }, [txHash, sendStatus]);

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
