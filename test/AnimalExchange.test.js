const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AnimalExchange Contract", function () {
  let chicken, sheep, exchange;
  let owner, user1, user2;

  beforeEach(async function () {
    // Get signers: owner deploys contracts; user1 and user2 will receive tokens.
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy Chicken contract
    const Chicken = await ethers.getContractFactory("Chicken");
    chicken = await Chicken.deploy();
    await chicken.waitForDeployment();

    // Deploy Sheep contract
    const Sheep = await ethers.getContractFactory("Sheep");
    sheep = await Sheep.deploy();
    await sheep.waitForDeployment();

    // Deploy AnimalExchange contract
    const AnimalExchange = await ethers.getContractFactory("AnimalExchange");
    exchange = await AnimalExchange.deploy();
    await exchange.waitForDeployment();

    // Set exchange address on Chicken and Sheep so that transfers from the exchange bypass restrictions.
    await chicken.setExchangeAddress(await exchange.getAddress());
    await sheep.setExchangeAddress(await exchange.getAddress());
  });

  it("should exchange 3 chickens (total value 3) for 1 sheep (value 3)", async function () {
    // Mint 3 chickens to user1 (each chicken has value CHICKEN_VALUE = 1)
    await chicken.mintChicken(user1.address, "Chicken 1", "QmChicken1");
    await chicken.mintChicken(user1.address, "Chicken 2", "QmChicken2");
    await chicken.mintChicken(user1.address, "Chicken 3", "QmChicken3");

    // Mint 1 sheep to user2 (sheep has value SHEEP_VALUE = 3)
    await sheep.mintSheep(user2.address, "Sheep 1", "QmSheep1");

    // Approve exchange contract to transfer tokens on behalf of owners.
    await chicken.connect(user1).setApprovalForAll(await exchange.getAddress(), true);
    await sheep.connect(user2).setApprovalForAll(await exchange.getAddress(), true);

    // Assuming fresh deployments, token IDs start at 1.
    const selectedChickens = [1, 2, 3];
    const selectedSheep = [1];

    // Execute exchange; since 1+1+1 equals 3, it should succeed.
    await expect(
      exchange.connect(user1).exchangeMultipleForMultiple(
        await chicken.getAddress(), selectedChickens,
        await sheep.getAddress(), selectedSheep
      )
    ).to.not.be.reverted;
  });

  it("should revert when exchanging 2 chickens (total value 2) for 1 sheep (value 3)", async function () {
    // Mint 2 chickens to user1.
    await chicken.mintChicken(user1.address, "Chicken 1", "QmChicken1");
    await chicken.mintChicken(user1.address, "Chicken 2", "QmChicken2");

    // Mint 1 sheep to user2.
    await sheep.mintSheep(user2.address, "Sheep 1", "QmSheep1");

    // Approve exchange contract.
    await chicken.connect(user1).setApprovalForAll(await exchange.getAddress(), true);
    await sheep.connect(user2).setApprovalForAll(await exchange.getAddress(), true);

    // Use token IDs [1,2] for chickens and [1] for sheep.
    const selectedChickens = [1, 2]; // total value = 1 + 1 = 2
    const selectedSheep = [1];       // total value = 3

    // Expect the exchange to revert because total values do not match.
    await expect(
      exchange.connect(user1).exchangeMultipleForMultiple(
        await chicken.getAddress(), selectedChickens,
        await sheep.getAddress(), selectedSheep
      )
    ).to.be.revertedWith("Total values do not match");
  });
});