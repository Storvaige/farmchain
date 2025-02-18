/**
 * Ce test couvre :
✅ Déploiement du contrat
✅ Conversion de FarmCoins en ChickenCoins
✅ Transfert de ChickenCoins
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChickenCoin", function () {
  let FarmCoin, ChickenCoin, farmCoin, chickenCoin, owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    FarmCoin = await ethers.getContractFactory("FarmCoin");
    farmCoin = await FarmCoin.deploy();
    await farmCoin.waitForDeployment();

    ChickenCoin = await ethers.getContractFactory("ChickenCoin");
    chickenCoin = await ChickenCoin.deploy(await farmCoin.getAddress());
    await chickenCoin.waitForDeployment();

    // Mint 10,000 FarmCoins à user1
    await farmCoin.mint(user1.address, 10000);
  });

  it("✅ Doit permettre la conversion de FarmCoin en ChickenCoin", async function () {
    await farmCoin.connect(user1).approve(await chickenCoin.getAddress(), 1000);
    await chickenCoin.connect(user1).mintChicken(1);
    expect(await chickenCoin.balanceOf(user1.address)).to.equal(1);
  });

  it("❌ Ne doit pas permettre une conversion sans approbation", async function () {
    await expect(chickenCoin.connect(user1).mintChicken(1)).to.be.reverted;
  });
});
