const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Lock Contract", function () {
  async function deployLockFixture() {
    const LOCK_DURATION = 365 * 24 * 60 * 60; // 1 an en secondes
    const ONE_GWEI = ethers.parseUnits("1", "gwei");

    const lockedAmount = ONE_GWEI;
    const unlockTime = (await time.latest()) + LOCK_DURATION;

    // Récupération des signers (propriétaire et autre utilisateur)
    const [owner, otherAccount] = await ethers.getSigners();

    // Déploiement du contrat Lock
    const Lock = await ethers.getContractFactory("Lock");
    const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

    return { lock, unlockTime, lockedAmount, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the correct unlockTime", async function () {
      const { lock, unlockTime } = await loadFixture(deployLockFixture);
      expect(await lock.unlockTime()).to.equal(unlockTime);
    });

    it("Should assign the correct owner", async function () {
      const { lock, owner } = await loadFixture(deployLockFixture);
      expect(await lock.owner()).to.equal(owner.address);
    });

    it("Should receive and store the locked funds", async function () {
      const { lock, lockedAmount } = await loadFixture(deployLockFixture);
      expect(await ethers.provider.getBalance(lock.target)).to.equal(lockedAmount);
    });

    it("Should revert if unlockTime is in the past", async function () {
      const latestTime = await time.latest();
      const Lock = await ethers.getContractFactory("Lock");

      // Vérifie que le déploiement échoue si le temps de déverrouillage est déjà passé
      await expect(Lock.deploy(latestTime, { value: 1 }))
        .to.be.revertedWith("Unlock time should be in the future");
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert if withdrawal is attempted too early", async function () {
        const { lock } = await loadFixture(deployLockFixture);
        await expect(lock.withdraw()).to.be.revertedWith("You can't withdraw yet");
      });

      it("Should revert if withdrawal is attempted by a non-owner", async function () {
        const { lock, unlockTime, otherAccount } = await loadFixture(deployLockFixture);

        // Simule le passage du temps jusqu'à la date de déverrouillage
        await time.increaseTo(unlockTime);

        // Vérifie que seul le propriétaire peut retirer les fonds
        await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith("You aren't the owner");
      });

      it("Should allow withdrawal if the unlockTime has passed and owner calls it", async function () {
        const { lock, unlockTime } = await loadFixture(deployLockFixture);

        // Simule le passage du temps jusqu'à la date de déverrouillage
        await time.increaseTo(unlockTime);

        // Vérifie que l'opération ne génère pas d'erreur
        await expect(lock.withdraw()).not.to.be.reverted;
      });
    });

    describe("Events", function () {
      it("Should emit a Withdrawal event upon successful withdrawal", async function () {
        const { lock, unlockTime, lockedAmount } = await loadFixture(deployLockFixture);

        // Simule le passage du temps jusqu'à la date de déverrouillage
        await time.increaseTo(unlockTime);

        // Vérifie que l'événement `Withdrawal` est bien émis
        await expect(lock.withdraw())
          .to.emit(lock, "Withdrawal")
          .withArgs(lockedAmount, anyValue); // anyValue pour accepter n'importe quelle valeur de timestamp
      });
    });

    describe("Transfers", function () {
      it("Should transfer the locked funds to the owner upon withdrawal", async function () {
        const { lock, unlockTime, lockedAmount, owner } = await loadFixture(deployLockFixture);

        // Simule le passage du temps jusqu'à la date de déverrouillage
        await time.increaseTo(unlockTime);

        // Vérifie que les fonds sont bien transférés de `lock` à `owner`
        await expect(lock.withdraw()).to.changeEtherBalances(
          [owner, lock],
          [lockedAmount, -lockedAmount]
        );
      });
    });
  });

  it("Should have 0 balance after successful withdrawal", async function () {
    const { lock, unlockTime } = await loadFixture(deployLockFixture);
    await time.increaseTo(unlockTime);
    await lock.withdraw();
    expect(await ethers.provider.getBalance(lock.target)).to.equal(0);
  });
  
  
});
