const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Animal Contract (Base)", function () {
  let animal, owner, addr1, addr2, exchange;

  async function increaseTimeAndMine(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine");
  }

  before(async function () {
    [owner, addr1, addr2, exchange] = await ethers.getSigners();
    
    const Chicken = await ethers.getContractFactory("Chicken");
    animal = await Chicken.deploy();
    await animal.waitForDeployment();
  });

  it("Should mint a Chicken NFT to addr1", async function () {
    await animal.mintChicken(addr1.address, "MyChicken", "QmIPFSHash");
    expect(await animal.balanceOf(addr1.address)).to.equal(1);
  });

  it("Should enforce the max token limit per owner", async function () {
    for (let i = 1; i < 10; i++) {
      await animal.mintChicken(addr1.address, `Chicken${i}`, "QmIPFSHash");
    }
    
    expect(await animal.balanceOf(addr1.address)).to.equal(10);
    
    await expect(animal.mintChicken(addr1.address, "Chicken11", "QmIPFSHash"))
      .to.be.revertedWith("Animal: receiver already has max tokens");
  });

  it("Should enforce lock period after acquisition", async function () {
    // Nettoyer quelques tokens de addr1 pour libérer de l'espace
    await animal.connect(addr1).burnResource(1);
    await animal.connect(addr1).burnResource(2);
    
    // Mint un nouveau token pour addr2
    await animal.mintChicken(addr2.address, "LockedChicken", "QmIPFSHash");
    const newTokenId = 11; // Le prochain ID après les 10 premiers

    // Tentative de transfert avant expiration du verrouillage
    await expect(
      animal.connect(addr2).transferFrom(addr2.address, addr1.address, newTokenId)
    ).to.be.revertedWith("Animal: token is locked after acquisition");

    // Attendre la fin du verrouillage
    await increaseTimeAndMine(601);

    // Le transfert doit maintenant être possible
    await animal.connect(addr2).transferFrom(addr2.address, addr1.address, newTokenId);
    expect(await animal.ownerOf(newTokenId)).to.equal(addr1.address);
  });

  it("Should allow exchange address to bypass restrictions", async function () {
    await animal.setExchangeAddress(exchange.address);
    
    // Nettoyer un token de plus pour faire de la place
    await animal.connect(addr1).burnResource(3);
    
    await animal.mintChicken(addr1.address, "ExchangeChicken", "QmIPFSHash");
    const exchangeTokenId = 12;
    
    await animal.connect(addr1).setApprovalForAll(exchange.address, true);

    await animal.connect(exchange).transferFrom(addr1.address, addr2.address, exchangeTokenId);
    expect(await animal.ownerOf(exchangeTokenId)).to.equal(addr2.address);
  });

  it("Should allow burning of tokens by owner or approved", async function () {
    await animal.mintChicken(addr1.address, "BurnChicken", "QmIPFSHash");
    const burnTokenId = 13;
    
    await animal.connect(addr1).burnResource(burnTokenId);
    
    await expect(animal.ownerOf(burnTokenId)).to.be.reverted;
  });

  it("Should prevent non-owners from burning tokens", async function () {
    await animal.mintChicken(addr1.address, "BadBurn", "QmIPFSHash");
    const nonOwnerBurnTokenId = 14;

    await expect(
      animal.connect(addr2).burnResource(nonOwnerBurnTokenId)
    ).to.be.revertedWith("Chicken: caller is not owner nor approved");
  });
});