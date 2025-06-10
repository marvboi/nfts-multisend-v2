// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockNFT
 * @dev Simple mock NFT contract for testing purposes
 */
contract MockNFT is ERC721, Ownable {
    constructor(string memory name, string memory symbol) 
        ERC721(name, symbol) 
        Ownable(msg.sender)
    {}

    /**
     * @dev Mints a new token to the specified address.
     * @param to The address that will receive the minted token.
     * @param tokenId The token ID to mint.
     */
    function mint(address to, uint256 tokenId) public onlyOwner {
        _mint(to, tokenId);
    }
}
