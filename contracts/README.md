# NFT MultiSender

A simple and efficient Ethereum smart contract that allows sending multiple ERC-721 NFTs to different addresses in a single transaction.

## Features

- Send multiple ERC-721 NFTs to different recipients in one transaction
- Gas-efficient implementation
- Compatible with all standard ERC-721 tokens
- Secure transfer using OpenZeppelin's IERC721 interface

## Smart Contract Overview

The `NFTMultiSender` contract contains a single function:

- `multisendNFT(address nftContract, address[] calldata recipients, uint256[] calldata tokenIds)`
  - Sends multiple NFTs from the caller's address to multiple recipient addresses in one transaction
  - The caller must be the owner of all NFTs being sent
  - The caller must have approved the NFTMultiSender contract to transfer their NFTs

## Prerequisites

- Node.js and npm
- Hardhat

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Testing

Run the test suite to ensure everything works properly:

```bash
npx hardhat test
```

## Deployment

To deploy the contract to a local Hardhat network:

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

To deploy to a testnet or mainnet, update the `hardhat.config.js` file with your network configuration and private key, then run:

```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

## Usage

1. Deploy the NFTMultiSender contract
2. Approve the contract to transfer your NFTs:
   - Call `setApprovalForAll(address operator, bool approved)` on the NFT contract, where operator is the NFTMultiSender contract address and approved is true
3. Call `multisendNFT` with:
   - The NFT contract address
   - An array of recipient addresses
   - An array of token IDs to be sent

## Security Considerations

- The contract requires that you are the owner of all tokens you're trying to send
- Make sure to approve the NFTMultiSender contract before using it
- Review the code and test thoroughly before using in production

## License

MIT
