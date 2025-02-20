const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

describe("Burn Chicken Script", function () {
  let admin, user1, user2;
  let chicken;
  let deploymentsPath;

  before(async function () {
    [admin, user1, user2] = await ethers.getSigners();
    deploymentsPath = path.join(__dirname, "../deployments/localhost.json");

    // Déployer Chicken
    const Chicken = await ethers.getContractFactory("Chicken");
    chicken = await Chicken.deploy();
    await chicken.waitForDeployment();

    // Sauvegarde dans `localhost.json`
    const data = {
      Chicken: await chicken.getAddress(),
      Admin: admin.address,
      User1: user1.address,
      User2: user2.address,
    };
    fs.writeFileSync(deploymentsPath, JSON.stringify(data, null, 2));
  });

  it("Should mint a Chicken to User1", async function () {
    await chicken.mintChicken(user1.address, "TestChicken", "QmTestHash");
    expect(await chicken.balanceOf(user1.address)).to.equal(1);
  });

  it("Should allow User1 to burn their Chicken", async function () {
    // Vérifier que User1 possède le token avant de le brûler
    const tokenId = 1;
    expect(await chicken.ownerOf(tokenId)).to.equal(user1.address);

    // Brûler le token en tant que User1
    await chicken.connect(user1).burnResource(tokenId);

    // Vérifier que le token n'existe plus
    await expect(chicken.ownerOf(tokenId)).to.be.reverted;
  });

  it("Should prevent User2 from burning User1's Chicken", async function () {
    // Minter un nouveau Chicken pour User1
    await chicken.mintChicken(user1.address, "AnotherChicken", "QmTestHash");
    const tokenId = 2;

    // Vérifier que User1 est bien le propriétaire
    expect(await chicken.ownerOf(tokenId)).to.equal(user1.address);

    // Tentative de brûlure par User2 (doit échouer)
    await expect(chicken.connect(user2).burnResource(tokenId))
      .to.be.revertedWith("Chicken: caller is not owner nor approved");
  });
});
