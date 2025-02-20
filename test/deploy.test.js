const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

describe("Deployment Script", function () {
  let admin, user1, user2;
  let chicken, sheep, elephant, exchange;
  let deploymentsPath;

  before(async function () {
    [admin, user1, user2] = await ethers.getSigners();
    deploymentsPath = path.join(__dirname, "../deployments/localhost.json");

    // Déployer Chicken
    const Chicken = await ethers.getContractFactory("Chicken");
    chicken = await Chicken.deploy();
    await chicken.waitForDeployment();

    // Déployer Sheep
    const Sheep = await ethers.getContractFactory("Sheep");
    sheep = await Sheep.deploy();
    await sheep.waitForDeployment();

    // Déployer Elephant
    const Elephant = await ethers.getContractFactory("Elephant");
    elephant = await Elephant.deploy();
    await elephant.waitForDeployment();

    // Déployer Exchange
    const AnimalExchange = await ethers.getContractFactory("AnimalExchange");
    exchange = await AnimalExchange.deploy();
    await exchange.waitForDeployment();

    // Associer l'Exchange aux contrats
    await chicken.setExchangeAddress(exchange.target);
    await sheep.setExchangeAddress(exchange.target);
    await elephant.setExchangeAddress(exchange.target);

    // Sauvegarde dans `localhost.json`
    const data = {
      Chicken: chicken.target,
      Sheep: sheep.target,
      Elephant: elephant.target,
      AnimalExchange: exchange.target,
      Admin: admin.address,
      User1: user1.address,
      User2: user2.address,
    };
    fs.writeFileSync(deploymentsPath, JSON.stringify(data, null, 2));
  });

  it("Should deploy all contracts and set correct addresses", async function () {
    // Vérifier si le fichier JSON existe
    expect(fs.existsSync(deploymentsPath)).to.be.true;

    // Charger le fichier et comparer les valeurs
    const deployedData = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));

    expect(deployedData.Chicken).to.equal(await chicken.getAddress());
    expect(deployedData.Sheep).to.equal(await sheep.getAddress());
    expect(deployedData.Elephant).to.equal(await elephant.getAddress());
    expect(deployedData.AnimalExchange).to.equal(await exchange.getAddress());
    expect(deployedData.Admin).to.equal(admin.address);
    expect(deployedData.User1).to.equal(user1.address);
    expect(deployedData.User2).to.equal(user2.address);
  });

  it("Should correctly set the exchange address in Chicken, Sheep, and Elephant contracts", async function () {
    expect(await chicken.exchangeAddress()).to.equal(exchange.target);
    expect(await sheep.exchangeAddress()).to.equal(exchange.target);
    expect(await elephant.exchangeAddress()).to.equal(exchange.target);
  });

  it("Should write valid JSON deployment file", function () {
    // Vérifier si le fichier est lisible et contient bien les données requises
    const data = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));
    expect(data).to.have.all.keys([
      "Chicken",
      "Sheep",
      "Elephant",
      "AnimalExchange",
      "Admin",
      "User1",
      "User2",
    ]);
  });
});
