/**
 * Ce test couvre :
✅ Déploiement du contrat
✅ Mint de tokens par l’owner
✅ Transfert de tokens
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FarmCoin", function () {
  let FarmCoin, farmCoin, owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    FarmCoin = await ethers.getContractFactory("FarmCoin");
    farmCoin = await FarmCoin.deploy();
    await farmCoin.waitForDeployment();
  });

  it("✅ Doit attribuer le propriétaire correct", async function () {
    expect(await farmCoin.owner()).to.equal(owner.address);
  });

  it("✅ Doit permettre au propriétaire de mint des tokens", async function () {
    await farmCoin.mint(user1.address, 1000);
    expect(await farmCoin.balanceOf(user1.address)).to.equal(1000);
  });

  it("✅ Doit autoriser les transferts de tokens", async function () {
    await farmCoin.mint(user1.address, 1000);
    await farmCoin.connect(user1).transfer(user2.address, 500);
    expect(await farmCoin.balanceOf(user2.address)).to.equal(500);
  });

  it("❌ Ne doit pas permettre à un utilisateur non-owner de mint", async function () {
    await expect(farmCoin.connect(user1).mint(user1.address, 1000)).to.be.reverted;
  });
});
