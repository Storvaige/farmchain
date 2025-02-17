// test/LivestockNFT.test.js
const { expect } = require("chai");

describe("LivestockNFT", function () {
  let FarmCoin, LivestockNFT, farmCoin, livestockNFT, owner, alice, bob;

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();

    // Déploiement des contrats
    FarmCoin = await ethers.getContractFactory("FarmCoin");
    farmCoin = await FarmCoin.deploy();
    
    LivestockNFT = await ethers.getContractFactory("LivestockNFT");
    livestockNFT = await LivestockNFT.deploy(farmCoin.target);

    // L'État distribue des FarmCoins
    await farmCoin.mint(alice.address, 1000);
    await farmCoin.mint(bob.address, 1000);
  });

  it("Transfert d'une vache coûte 50 FarmCoins à l'acheteur", async () => {
    // Alice crée une vache gratuitement
    await livestockNFT.connect(alice).mint(2); // 2 = VACHE
    
    // ⏳ Simulation du passage du temps (10 minutes + 1 seconde)
    await ethers.provider.send("evm_increaseTime", [10 * 60 + 1]); // 601 secondes
    await ethers.provider.send("evm_mine"); // Mine un nouveau bloc avec le nouveau timestamp

    // Bob approuve le contrat à dépenser 50 FARM
    await farmCoin.connect(bob).approve(livestockNFT.target, 50);

    // Alice transfert la vache à Bob
    await livestockNFT.connect(alice).transferFrom(alice.address, bob.address, 1);

    // Vérifications
    expect(await livestockNFT.ownerOf(1)).to.equal(bob.address);
    expect(await farmCoin.balanceOf(alice.address)).to.equal(1000 + 50);
    expect(await farmCoin.balanceOf(bob.address)).to.equal(1000 - 50);
});
});