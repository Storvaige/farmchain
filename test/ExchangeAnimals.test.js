const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ExchangeAnimals Contract", function () {
  let exchange, chicken, sheep, elephant;
  let owner, addr1, addr2;

  // Fonction pour avancer le temps et éviter les erreurs de cooldown
  async function increaseTimeAndMine(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
  }

  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Chicken = await ethers.getContractFactory("Chicken");
    const Sheep = await ethers.getContractFactory("Sheep");
    const Elephant = await ethers.getContractFactory("Elephant");

    chicken = await Chicken.deploy();
    sheep = await Sheep.deploy();
    elephant = await Elephant.deploy();

    await chicken.waitForDeployment();
    await sheep.waitForDeployment();
    await elephant.waitForDeployment();

    const ExchangeAnimals = await ethers.getContractFactory("ExchangeAnimals");
    exchange = await ExchangeAnimals.deploy(
      chicken.target,
      sheep.target,
      elephant.target
    );
    await exchange.waitForDeployment();
  });

  it("Should convert 10 Chicken into 1 Sheep", async function () {
    // 🔥 Mint 10 Chicken pour addr1
    for (let i = 1; i <= 10; i++) {
      await chicken.mintChicken(addr1.address, `Chicken${i}`, "QmIPFSHashChicken");
    // ⏳ Attente de 10 minutes après l'acquisition pour éviter le verrouillage initial
    await increaseTimeAndMine(601);
    }
    // ⏳ Attente de 10 minutes après l'acquisition pour éviter le verrouillage initial
    await increaseTimeAndMine(601);
  

    expect(await chicken.balanceOf(addr1.address)).to.equal(10);

    // 🔄 Autoriser le contrat à gérer les transferts
    await chicken.connect(addr1).setApprovalForAll(exchange.target, true);

    // ⏳ Attente de 5 minutes supplémentaires pour éviter le cooldown
    await increaseTimeAndMine(301);

    // 🔄 Conversion des Chicken en Sheep
    const chickenTokenIds = Array.from({ length: 10 }, (_, i) => i + 1);
    // ⏳ Attente de 5 minutes supplémentaires pour éviter le cooldown
    await increaseTimeAndMine(301);
    await exchange.connect(addr1).convertChickenToSheep(
      chickenTokenIds,
      "MySheep",
      "QmIPFSHashSheep",
      3
    );

    // ✅ Vérifier la conversion réussie
    expect(await chicken.balanceOf(addr1.address)).to.equal(0);
    expect(await sheep.balanceOf(addr1.address)).to.equal(1);
  });

  it("Should convert 10 Sheep into 1 Elephant", async function () {
    // 🔥 Mint 10 Sheep pour addr1
    for (let i = 1; i <= 10; i++) {
      await sheep.mintSheep(addr1.address, `Sheep${i}`, "QmIPFSHashSheep");
      // ⏳ Attente de 10 minutes après l'acquisition pour éviter le verrouillage initial
    await increaseTimeAndMine(601);
    }

    expect(await sheep.balanceOf(addr1.address)).to.equal(10);

    // 🔄 Autoriser le contrat à gérer les transferts
    await sheep.connect(addr1).setApprovalForAll(exchange.target, true);

    // ⏳ Attente de 5 minutes supplémentaires pour éviter le cooldown
    await increaseTimeAndMine(301);

    // 🔄 Conversion des Sheep en Elephant
    const sheepTokenIds = Array.from({ length: 10 }, (_, i) => i + 1);
    // ⏳ Attente de 5 minutes supplémentaires pour éviter le cooldown
    await increaseTimeAndMine(301);
    await exchange.connect(addr1).convertSheepToElephant(
      sheepTokenIds,
      "MyElephant",
      "QmIPFSHashElephant",
      9
    );

    // ✅ Vérifier la conversion réussie
    expect(await sheep.balanceOf(addr1.address)).to.equal(0);
    expect(await elephant.balanceOf(addr1.address)).to.equal(1);
  });

  it("Should fail to convert if not exactly 10 Chicken", async function () {
    // ❌ Essayer de convertir 5 Chicken (doit échouer)
    const chickenTokenIds = [1, 2, 3, 4, 5];

    await expect(
      exchange.connect(addr1).convertChickenToSheep(
        chickenTokenIds,
        "MySheep",
        "QmIPFSHashSheep",
        3
      )
    ).to.be.revertedWith("Need exactly 10 Chicken tokens");
  });

  it("Should fail to convert if not exactly 10 Sheep", async function () {
    // ❌ Essayer de convertir 7 Sheep (doit échouer)
    const sheepTokenIds = [1, 2, 3, 4, 5, 6, 7];

    await expect(
      exchange.connect(addr1).convertSheepToElephant(
        sheepTokenIds,
        "MyElephant",
        "QmIPFSHashElephant",
        9
      )
    ).to.be.revertedWith("Need exactly 10 Sheep tokens");
  });

  it("Should fail if not the owner of the Chicken tokens", async function () {
    // 🔥 Mint 10 Chicken pour addr2 mais addr1 tente de les utiliser
    for (let i = 11; i <= 20; i++) {
      await chicken.mintChicken(addr2.address, `Chicken${i}`, "QmIPFSHashChicken");
    }

    // ❌ Addr1 essaie de convertir les Chicken d'addr2 (doit échouer)
    const chickenTokenIds = Array.from({ length: 10 }, (_, i) => i + 11);

    await expect(
      exchange.connect(addr1).convertChickenToSheep(
        chickenTokenIds,
        "MySheep",
        "QmIPFSHashSheep",
        3
      )
    ).to.be.revertedWith("Not owner of these Chicken tokens");
  });

  it("Should fail if not the owner of the Sheep tokens", async function () {
    // 🔥 Mint 10 Sheep pour addr2 mais addr1 tente de les utiliser
    for (let i = 11; i <= 20; i++) {
      await sheep.mintSheep(addr2.address, `Sheep${i}`, "QmIPFSHashSheep");
    }

    // ❌ Addr1 essaie de convertir les Sheep d'addr2 (doit échouer)
    const sheepTokenIds = Array.from({ length: 10 }, (_, i) => i + 11);

    await expect(
      exchange.connect(addr1).convertSheepToElephant(
        sheepTokenIds,
        "MyElephant",
        "QmIPFSHashElephant",
        9
      )
    ).to.be.revertedWith("Not owner of these Sheep tokens");
  });
});
