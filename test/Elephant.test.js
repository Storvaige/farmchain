const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Elephant Contract", function () {
  let elephant, owner, addr1, addr2;

  // Fonction pour avancer le temps
  async function increaseTimeAndMine(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine");
  }

  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Elephant = await ethers.getContractFactory("Elephant");
    elephant = await Elephant.deploy();
    await elephant.waitForDeployment();
  });

  it("Should mint an Elephant NFT to addr1", async function () {
    await elephant.mintElephant(addr1.address, "MyElephant", "QmIPFSHashElephant");
    expect(await elephant.balanceOf(addr1.address)).to.equal(1);
  });

  it("Should enforce the max token limit per owner", async function () {
    // Mint 9 Elephants pour addr1
    for (let i = 1; i <= 9; i++) {
      await elephant.mintElephant(addr1.address, `Elephant${i}`, "QmIPFSHashElephant");
    }
    expect(await elephant.balanceOf(addr1.address)).to.equal(10);

    // 🔄 **Transférer un Elephant pour libérer un slot**
    await increaseTimeAndMine(601);
    await elephant.connect(addr1).transferFrom(addr1.address, addr2.address, 1);

    // ⏳ **Attendre la fin du cooldown avant de minter**
    await increaseTimeAndMine(301);

    // ✅ Maintenant, addr1 a bien 9 Elephants, on peut minter un autre
    await elephant.mintElephant(addr1.address, "Elephant11", "QmIPFSHashElephant");
    expect(await elephant.balanceOf(addr1.address)).to.equal(10);
  });

  
  it("Should retrieve correct metadata", async function () {
    const tokenId = 1;
    const elephantValue = await elephant.ELEPHANT_VALUE();
    const meta = await elephant.getResourceMetadata(tokenId);
    expect(meta.name).to.equal("MyElephant");
    expect(meta.resourceType).to.equal("Elephant");
    expect(meta.value).to.equal(elephantValue);
    expect(meta.ipfsHash).to.equal("QmIPFSHashElephant");
  });
});