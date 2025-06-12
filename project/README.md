# NFT MultiSender v2 🚀

A modern, gas-efficient React application for bulk NFT transfers on Base network. Send multiple NFTs to different recipients in a single transaction with a beautiful, responsive UI.

![BETA](https://img.shields.io/badge/Status-BETA-orange)
![Base Network](https://img.shields.io/badge/Network-Base-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🚀 **Bulk NFT Transfers** - Send multiple NFTs in one transaction
- 💰 **Gas Efficient** - Optimized smart contract reduces gas costs
- 🎨 **Beautiful UI** - Modern design with cream/dark theme switching
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🔗 **RainbowKit Integration** - Seamless wallet connections
- ⚡ **Fast & Reliable** - Built with Vite + TypeScript
- 🔍 **NFT Discovery** - Search and browse your NFT collections
- 📊 **Transaction Tracking** - Real-time status updates
- 🛡️ **Ownership Verification** - Ensures you own NFTs before transfer

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Web3**: Wagmi v2 + RainbowKit + Viem
- **Smart Contract**: Solidity (deployed on Base Mainnet)
- **APIs**: OpenSea + Reservoir for NFT data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- A Web3 wallet (MetaMask, etc.)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/marvboi/nfts-multisend-v2.git
cd nfts-multisend-v2
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
   - See [ENV_TEMPLATE.md](./ENV_TEMPLATE.md) for detailed setup instructions
   - Create a `.env` file with your API keys

4. **Start development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## 🔧 Environment Setup

This project requires API keys for NFT data fetching. See [ENV_TEMPLATE.md](./ENV_TEMPLATE.md) for:
- Required environment variables
- How to obtain API keys
- Step-by-step setup guide

## 📋 Smart Contract

The NFT MultiSender contract is deployed on **Base Mainnet**:
- **Address**: `0x06b19919dC569883a7B79c4d881B1dCa3a393227`
- **Network**: Base (Chain ID: 8453)
- **Verified**: ✅ On BaseScan

### Contract Features:
- Batch NFT transfers with error handling
- Gas-optimized operations
- Support for ERC-721 tokens
- Event logging for tracking

## 🎯 How to Use

1. **Connect Wallet** - Use RainbowKit to connect your Web3 wallet
2. **Select NFTs** - Browse your collections or search by contract address
3. **Add Recipients** - Enter wallet addresses manually or upload CSV
4. **Review & Send** - Confirm transaction details and execute transfer
5. **Track Progress** - Monitor transaction status in real-time

## 🔒 Security Features

- Ownership verification before transfers
- Approval status checking
- Transaction simulation
- Error handling and recovery
- No private key storage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the Base ecosystem
- Powered by RainbowKit and Wagmi
- NFT data from OpenSea and Reservoir APIs

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation
- Review the environment setup guide

---

**Made with 爪ㄒㄖㄖㄥ丂** 🛠️ 