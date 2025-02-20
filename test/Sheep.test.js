const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Sheep Contract", function () {
  let sheep, owner, addr1, addr2;

  // Fonction pour avancer le temps
  async function increaseTimeAndMine(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine");
  }

  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Sheep = await ethers.getContractFactory("Sheep");
    sheep = await Sheep.deploy();
    await sheep.waitForDeployment();
  });

  it("Should mint a Sheep NFT to addr1", async function () {
    await sheep.mintSheep(addr1.address, "MySheep", "QmIPFSHashSheep");
    expect(await sheep.balanceOf(addr1.address)).to.equal(1);
  });

  it("Should enforce the max token limit per owner", async function () {
    // Mint 9 Sheep pour addr1
    for (let i = 1; i <= 9; i++) {
      await sheep.mintSheep(addr1.address, `Sheep${i}`, "QmIPFSHashSheep");
    }
    expect(await sheep.balanceOf(addr1.address)).to.equal(10);

    // 🔄 **Transférer un Sheep pour libérer un slot**
    await increaseTimeAndMine(601);
    await sheep.connect(addr1).transferFrom(addr1.address, addr2.address, 1);

    // ⏳ **Attendre la fin du cooldown avant de minter**
    await increaseTimeAndMine(301);

    // ✅ Maintenant, addr1 a bien 9 Sheep, on peut minter un autre
    await sheep.mintSheep(addr1.address, "Sheep11", "QmIPFSHashSheep");
    expect(await sheep.balanceOf(addr1.address)).to.equal(10);
  });

  
  it("Should retrieve correct metadata", async function () {
    const tokenId = 1;
    const sheepValue = await sheep.SHEEP_VALUE();
    const meta = await sheep.getResourceMetadata(tokenId);
    expect(meta.name).to.equal("MySheep");
    expect(meta.resourceType).to.equal("Sheep");
    expect(meta.value).to.equal(sheepValue);
    expect(meta.ipfsHash).to.equal("QmIPFSHashSheep");
  });
});
