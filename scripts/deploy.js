require("./polyfillFetch");
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");
const { create } = require("ipfs-http-client");

async function main() {
  // 0) Start by uploading images to local IPFS
  const ipfs = create({
    host: "127.0.0.1",
    port: 5001,
    protocol: "http",
  });
  console.log("Connected to local IPFS on http://127.0.0.1:5001");

  // We'll read the 3 images from the assets folder
  const assetsDir = path.join(__dirname, "../assets");

  // 0.1) Chicken image
  const chickenData = fs.readFileSync(path.join(assetsDir, "chicken.png"));
  const chickenResult = await ipfs.add(chickenData);
  const chickenCID = chickenResult.cid.toString();
  console.log("Uploaded Chicken image to IPFS, CID =", chickenCID);

  // 0.2) Sheep image
  const sheepData = fs.readFileSync(path.join(assetsDir, "sheep.png"));
  const sheepResult = await ipfs.add(sheepData);
  const sheepCID = sheepResult.cid.toString();
  console.log("Uploaded Sheep image to IPFS, CID =", sheepCID);

  // 0.3) Elephant image
  const elephantData = fs.readFileSync(path.join(assetsDir, "elephant.png"));
  const elephantResult = await ipfs.add(elephantData);
  const elephantCID = elephantResult.cid.toString();
  console.log("Uploaded Elephant image to IPFS, CID =", elephantCID);

  // 1) Deploy the 3 contracts
  const [admin, user1, user2] = await ethers.getSigners();
  console.log("\nDeploying with admin address:", admin.address);
  console.log("User1 address:", user1.address);
  console.log("User2 address:", user2.address);

  // Chicken
  const Chicken = await ethers.getContractFactory("Chicken");
  const chicken = await Chicken.deploy();
  await chicken.waitForDeployment();
  const chickenAddress = await chicken.getAddress();
  console.log("Chicken deployed to:", chickenAddress);

  // Sheep
  const Sheep = await ethers.getContractFactory("Sheep");
  const sheep = await Sheep.deploy();
  await sheep.waitForDeployment();
  const sheepAddress = await sheep.getAddress();
  console.log("Sheep deployed to:", sheepAddress);

  // Elephant
  const Elephant = await ethers.getContractFactory("Elephant");
  const elephant = await Elephant.deploy();
  await elephant.waitForDeployment();
  const elephantAddress = await elephant.getAddress();
  console.log("Elephant deployed to:", elephantAddress);

  // AnimalExchange
  const AnimalExchange = await ethers.getContractFactory("AnimalExchange");
  const exchange = await AnimalExchange.deploy();
  await exchange.waitForDeployment();
  const exchangeAddress = await exchange.getAddress();
  console.log("AnimalExchange deployed to:", exchangeAddress);


  await chicken.setExchangeAddress(exchangeAddress);
  await sheep.setExchangeAddress(exchangeAddress);
  await elephant.setExchangeAddress(exchangeAddress);



  // 2) Write addresses + IPFS CIDs to deployments/localhost.json
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  const filePath = path.join(deploymentsDir, "localhost.json");
  const data = {
    // Contract addresses
    Chicken: chickenAddress,
    Sheep: sheepAddress,
    Elephant: elephantAddress,
    AnimalExchange: exchangeAddress,
    // IPFS CIDs for images
    ChickenCID: chickenCID,
    SheepCID: sheepCID,
    ElephantCID: elephantCID,
    // Signers
    Admin: admin.address,
    User1: user1.address,
    User2: user2.address,
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`\nWrote addresses + IPFS CIDs to ${filePath}`);

  console.log("\n== Deployment + IPFS done. ==");
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
