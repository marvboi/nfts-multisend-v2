const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMultiSender", function () {
  let NFTMultiSender;
  let nftMultiSender;
  let MockNFT;
  let mockNFT;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addrs;

  beforeEach(async function () {
    // Deploy a mock NFT for testing
    MockNFT = await ethers.getContractFactory("MockNFT");
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
    mockNFT = await MockNFT.deploy("MockNFT", "MNFT");
    await mockNFT.waitForDeployment();

    // Deploy the NFTMultiSender contract
    NFTMultiSender = await ethers.getContractFactory("NFTMultiSender");
    nftMultiSender = await NFTMultiSender.deploy();
    await nftMultiSender.waitForDeployment();

    // Mint some NFTs to the owner for testing
    await mockNFT.mint(owner.address, 1);
    await mockNFT.mint(owner.address, 2);
    await mockNFT.mint(owner.address, 3);

    // Approve the MultiSender contract to transfer the owner's NFTs
    await mockNFT.setApprovalForAll(await nftMultiSender.getAddress(), true);
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await nftMultiSender.getAddress()).to.be.properAddress;
    });
  });

  describe("MultiSend Functionality", function () {
    it("Should send multiple NFTs to multiple addresses", async function () {
      const recipients = [addr1.address, addr2.address, addr3.address];
      const tokenIds = [1, 2, 3];

      // Send the NFTs
      await nftMultiSender.multisendNFT(await mockNFT.getAddress(), recipients, tokenIds);

      // Check that the recipients now own the correct tokens
      expect(await mockNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await mockNFT.ownerOf(2)).to.equal(addr2.address);
      expect(await mockNFT.ownerOf(3)).to.equal(addr3.address);
    });

    it("Should revert if arrays have different lengths", async function () {
      const recipients = [addr1.address, addr2.address];
      const tokenIds = [1, 2, 3]; // One more token than recipients

      await expect(
        nftMultiSender.multisendNFT(await mockNFT.getAddress(), recipients, tokenIds)
      ).to.be.revertedWith("Recipients and tokenIds arrays must have the same length");
    });

    it("Should revert if caller is not the owner of all tokens", async function () {
      // Mint token 4 to addr1
      await mockNFT.mint(addr1.address, 4);

      const recipients = [addr2.address];
      const tokenIds = [4]; // Owner doesn't own token 4

      await expect(
        nftMultiSender.multisendNFT(await mockNFT.getAddress(), recipients, tokenIds)
      ).to.be.revertedWith("You must be the owner of the token");
    });
  });
});
