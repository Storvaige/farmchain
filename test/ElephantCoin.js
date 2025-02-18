/**
 * Ce test couvre :
✅ Conversion de ChickenCoins en ElephantCoins
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ElephantCoin", function () {
  let FarmCoin, ChickenCoin, ElephantCoin;
  let farmCoin, chickenCoin, elephantCoin;
  let owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    FarmCoin = await ethers.getContractFactory("FarmCoin");
    farmCoin = await FarmCoin.deploy();
    await farmCoin.waitForDeployment();

    ChickenCoin = await ethers.getContractFactory("ChickenCoin");
    chickenCoin = await ChickenCoin.deploy(await farmCoin.getAddress());
    await chickenCoin.waitForDeployment();

    ElephantCoin = await ethers.getContractFactory("ElephantCoin");
    elephantCoin = await ElephantCoin.deploy(await chickenCoin.getAddress());
    await elephantCoin.waitForDeployment();

    // Mint 1,000,000 FarmCoins et convertir en ChickenCoins
    await farmCoin.mint(user1.address, 1000000);
    await farmCoin.connect(user1).approve(await chickenCoin.getAddress(), 1000000);
    await chickenCoin.connect(user1).mintChicken(1000);
  });

  it("✅ Doit permettre la conversion de ChickenCoin en ElephantCoin", async function () {
    await chickenCoin.connect(user1).approve(await elephantCoin.getAddress(), 1000);
    await elephantCoin.connect(user1).mintElephant(1);
    expect(await elephantCoin.balanceOf(user1.address)).to.equal(1);
  });
});
