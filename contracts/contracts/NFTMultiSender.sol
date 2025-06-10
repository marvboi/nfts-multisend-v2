// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title NFTMultiSender
 * @dev Enhanced contract for sending multiple ERC-721 NFTs to different addresses in a single transaction
 * with improved error handling and support for different transfer methods
 */
contract NFTMultiSender is IERC721Receiver {
    // Events for better tracking and debugging
    event NFTSent(address indexed nftContract, address indexed from, address indexed to, uint256 tokenId, bool success);
    event TransferError(address indexed nftContract, uint256 tokenId, string reason);
    
    /**
     * @dev Required function to receive ERC721 tokens
     */
    function onERC721Received(
        address, 
        address, 
        uint256, 
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
    
    /**
     * @dev Sends multiple ERC-721 NFTs to multiple recipients in one transaction with enhanced error handling.
     * @param nftContract Address of the ERC-721 contract
     * @param recipients Array of recipient addresses
     * @param tokenIds Array of token IDs to be sent
     * @notice The caller must be the owner of all specified tokenIds and must have approved 
     * this contract to transfer the NFTs or have set approval for all.
     */
    function multisendNFT(
        address nftContract,
        address[] calldata recipients,
        uint256[] calldata tokenIds
    ) external {
        // Verify that the input arrays have the same length
        require(recipients.length == tokenIds.length, "Recipients and tokenIds arrays must have the same length");
        
        // Get the ERC-721 contract instance
        IERC721 nft = IERC721(nftContract);
        
        // Transfer each NFT to its respective recipient
        for (uint i = 0; i < recipients.length; i++) {
            // Ensure the caller is the owner of the token
            require(nft.ownerOf(tokenIds[i]) == msg.sender, "You must be the owner of the token");
            
            try nft.safeTransferFrom(msg.sender, recipients[i], tokenIds[i]) {
                // Successfully transferred
                emit NFTSent(nftContract, msg.sender, recipients[i], tokenIds[i], true);
            } catch Error(string memory reason) {
                // Log the error but continue with the next transfer
                emit TransferError(nftContract, tokenIds[i], reason);
            } catch {
                // Unknown error
                emit TransferError(nftContract, tokenIds[i], "Unknown transfer error");
            }
        }
    }
    
    /**
     * @dev Alternative transfer method that uses transferFrom instead of safeTransferFrom.
     * This can be used as a fallback if safeTransferFrom doesn't work with certain NFTs.
     */
    function multisendNFTUnsafe(
        address nftContract,
        address[] calldata recipients,
        uint256[] calldata tokenIds
    ) external {
        // Verify that the input arrays have the same length
        require(recipients.length == tokenIds.length, "Recipients and tokenIds arrays must have the same length");
        
        // Get the ERC-721 contract instance
        IERC721 nft = IERC721(nftContract);
        
        // Transfer each NFT to its respective recipient using transferFrom
        for (uint i = 0; i < recipients.length; i++) {
            // Ensure the caller is the owner of the token
            require(nft.ownerOf(tokenIds[i]) == msg.sender, "You must be the owner of the token");
            
            try nft.transferFrom(msg.sender, recipients[i], tokenIds[i]) {
                // Successfully transferred
                emit NFTSent(nftContract, msg.sender, recipients[i], tokenIds[i], true);
            } catch Error(string memory reason) {
                // Log the error but continue with the next transfer
                emit TransferError(nftContract, tokenIds[i], reason);
            } catch {
                // Unknown error
                emit TransferError(nftContract, tokenIds[i], "Unknown transfer error");
            }
        }
    }
}
