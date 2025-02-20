const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Chicken Contract", function () {
  let chicken, owner, addr1, addr2;

  // Fonction pour avancer le temps
  async function increaseTimeAndMine(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine");
  }

  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Chicken = await ethers.getContractFactory("Chicken");
    chicken = await Chicken.deploy();
    await chicken.waitForDeployment();
  });

  it("Should mint a Chicken NFT to addr1", async function () {
    await chicken.mintChicken(addr1.address, "MyChicken", "QmIPFSHash");
    expect(await chicken.balanceOf(addr1.address)).to.equal(1);
  });

  it("Should enforce the max token limit per owner", async function () {
    // Mint 9 Chickens pour addr1
    for (let i = 1; i <= 9; i++) {
      await chicken.mintChicken(addr1.address, `Chicken${i}`, "QmIPFSHash");
    }
    expect(await chicken.balanceOf(addr1.address)).to.equal(10);

    // 🔄 **Transférer un Chicken pour libérer un slot**
    await increaseTimeAndMine(601);
    await chicken.connect(addr1).transferFrom(addr1.address, addr2.address, 1);

    // ⏳ **Attendre la fin du cooldown avant de minter**
    await increaseTimeAndMine(301);

    // ✅ Maintenant, addr1 a bien 9 Chickens, on peut minter un autre
    await chicken.mintChicken(addr1.address, "Chicken11", "QmIPFSHash");
    expect(await chicken.balanceOf(addr1.address)).to.equal(10);
  });


  it("Should retrieve correct metadata", async function () {
    const tokenId = 1;
    const chickenValue = await chicken.CHICKEN_VALUE();
    const meta = await chicken.getResourceMetadata(tokenId);
    expect(meta.name).to.equal("MyChicken");
    expect(meta.resourceType).to.equal("Chicken");
    expect(meta.value).to.equal(chickenValue);
    expect(meta.ipfsHash).to.equal("QmIPFSHash");
  });

});