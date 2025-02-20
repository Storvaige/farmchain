const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Animal Contract (via Chicken.sol)", function () {
  let chicken, owner, addr1, addr2, addr3;

  // 🛠 Fonction utilitaire pour avancer le temps et générer un bloc
  async function increaseTimeAndMine(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
  }

  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Déploiement du contrat Chicken (hérite d'Animal)
    const Chicken = await ethers.getContractFactory("Chicken");
    chicken = await Chicken.deploy();
    await chicken.waitForDeployment();
  });

  // 📌 TEST 1: Mint d'un Chicken
  it("Should mint a Chicken NFT to addr1", async function () {
    await chicken.mintChicken(addr1.address, "Chicken1", "QmIPFSHash");
    expect(await chicken.balanceOf(addr1.address)).to.equal(1);
  });

  // 📌 TEST 2: Vérifier le verrouillage après acquisition
  it("Should enforce lock period after acquisition", async function () {
    // 🔥 Mint un Chicken à addr1
    await chicken.mintChicken(addr1.address, "LockedChicken", "QmIPFSHash");

    // ✅ Récupérer le tokenId du dernier mint (2ème mint donc tokenId = 2)
    const tokenId = 2;

    // 🕒 Vérifier que le NFT est verrouillé immédiatement après le mint
    const metadata = await chicken.getResourceMetadata(tokenId);
    const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    expect(currentTime).to.be.lessThan(metadata.lockedUntil);

    // ❌ Essayer de transférer immédiatement après le mint (doit échouer)
    await expect(
      chicken.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId)
    ).to.be.revertedWith("Animal: token is locked after acquisition");

    // ⏳ Attendre la fin du verrouillage (10 minutes)
    await increaseTimeAndMine(601);

    // ✅ Transfert doit réussir après expiration du verrouillage
    await chicken.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId);

    // 🎯 Vérifier que le NFT appartient bien à addr2 après transfert
    expect(await chicken.ownerOf(tokenId)).to.equal(addr2.address);
  });

  // 📌 TEST 3: Vérifier la limite de 10 tokens par utilisateur
  it("Should enforce the max token limit per owner", async function () {
    for (let i = 2; i <= 10; i++) {
      await chicken.mintChicken(addr1.address, `Chicken${i}`, "QmIPFSHash");
    }
    expect(await chicken.balanceOf(addr1.address)).to.equal(10);

    // ❌ Essayer de minter un 11ème Chicken → doit échouer
    await expect(
      chicken.mintChicken(addr1.address, "Chicken11", "QmIPFSHash")
    ).to.be.revertedWith("Animal: receiver already has 10 tokens of this type");
  });

  /*// 📌 TEST 4: Vérifier le cooldown entre transferts
  it("Should enforce cooldown between transfers", async function () {
    // 🔥 Mint 10 Chicken pour addr1
    for (let i = 1; i <= 10; i++) {
      await chicken.mintChicken(addr1.address, `Chicken${i}`, "QmIPFSHash");
    }

    // ✅ Vérifier que addr1 possède bien 10 tokens
    expect(await chicken.balanceOf(addr1.address)).to.equal(10);

    // 🔄 Approuver addr1 pour pouvoir transférer ses tokens
    await chicken.connect(addr1).setApprovalForAll(addr2.address, true);

    // ⏳ Attendre la fin du verrouillage initial (10 minutes)
    await increaseTimeAndMine(600);

    // 🔄 Transfert Chicken #1 de addr1 → addr2 ✅
    await chicken.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
    expect(await chicken.ownerOf(1)).to.equal(addr2.address);

    // ✅ Vérifier que addr1 a maintenant 9 tokens
    expect(await chicken.balanceOf(addr1.address)).to.equal(9);

    // ✅ Maintenant, addr1 peut minter un autre Chicken
    await chicken.mintChicken(addr1.address, "NewChicken", "QmIPFSHash");

    // 🔄 Vérifier que addr1 a de nouveau 10 tokens
    expect(await chicken.balanceOf(addr1.address)).to.equal(10);

    // ⏳ Attendre 5 minutes (COOLDOWN exact)
    console.log("⏳ Attente du cooldown de 5 minutes...");
    await increaseTimeAndMine(300);

    // 🔄 Premier transfert après cooldown (addr1 ➝ addr2) ✅
    await chicken.connect(addr1).transferFrom(addr1.address, addr2.address, 2);
    expect(await chicken.ownerOf(2)).to.equal(addr2.address);

    // ❌ Essayer un transfert immédiat après (doit échouer à cause du cooldown)
    await expect(
      chicken.connect(addr2).transferFrom(addr2.address, addr1.address, 2)
    ).to.be.revertedWith("Animal: transfer cooldown not finished");

    // ⏳ Attente exacte du cooldown (5 minutes)
    console.log("⏳ Attente du cooldown exact de 5 minutes...");
    await increaseTimeAndMine(300);

    // ✅ Maintenant, le transfert doit être autorisé
    await chicken.connect(addr2).transferFrom(addr2.address, addr1.address, 2);
    expect(await chicken.ownerOf(2)).to.equal(addr1.address);
  });*/
  
});
