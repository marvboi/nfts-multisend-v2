// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy NFTMultiSender
  const NFTMultiSender = await ethers.getContractFactory("NFTMultiSender");
  const nftMultiSender = await NFTMultiSender.deploy();
  await nftMultiSender.waitForDeployment();

  const nftMultiSenderAddress = await nftMultiSender.getAddress();
  console.log("NFTMultiSender deployed to:", nftMultiSenderAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
