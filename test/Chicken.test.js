const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Chicken Contract", function () {
  let chicken, owner, addr1;

  before(async function () {
    [owner, addr1] = await ethers.getSigners();
    const Chicken = await ethers.getContractFactory("Chicken");
    chicken = await Chicken.deploy();
    await chicken.waitForDeployment();
  });

  it("Should mint a Chicken NFT to addr1", async function () {
    await chicken.mintChicken(addr1.address, "MyChicken", "QmIPFSHash");
    expect(await chicken.balanceOf(addr1.address)).to.equal(1);
  });

  it("Should retrieve correct metadata", async function () {
    const tokenId = 1;
    const meta = await chicken.getResourceMetadata(tokenId);
    expect(meta.name).to.equal("MyChicken");
    expect(meta.resourceType).to.equal("Chicken");
    expect(meta.value).to.equal(1);
    expect(meta.ipfsHash).to.equal("QmIPFSHash");
  });
});
