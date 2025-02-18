/**
 * Ce test couvre :
✅ Enregistrement d'une ressource
✅ Mise à jour après un transfert
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ResourceRegistry", function () {
  let ResourceRegistry, resourceRegistry, owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    ResourceRegistry = await ethers.getContractFactory("ResourceRegistry");
    resourceRegistry = await ResourceRegistry.deploy();
    await resourceRegistry.waitForDeployment();
  });

  it("✅ Doit enregistrer une ressource", async function () {
    const tx = await resourceRegistry.registerResource(
      "Test Resource",
      "test",
      1,
      "Qm12345", // Hash IPFS fictif
      user1.address
    );
    const receipt = await tx.wait();
    const event = receipt.logs[0];
    expect(event).to.exist;
  });

  it("✅ Doit mettre à jour le propriétaire après un transfert", async function () {
    const tx = await resourceRegistry.registerResource(
      "Test Resource",
      "test",
      1,
      "Qm12345",
      user1.address
    );
    await tx.wait();

    await resourceRegistry.updateTransfer(0, user2.address);
    const resource = await resourceRegistry.getResource(0);
    expect(resource.previousOwners).to.include(user2.address);
  });
});
