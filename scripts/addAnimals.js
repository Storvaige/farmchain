// scripts/addAnimals.js
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  // 1. On lit le fichier deployments/localhost.json
  const deploymentsDir = path.join(__dirname, "../deployments");
  const filePath = path.join(deploymentsDir, "localhost.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}. Deploy your contracts first!`);
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  // data.Chicken, data.Sheep, data.Elephant, etc.

  // 2. On récupère le Signer admin
  const [admin] = await ethers.getSigners();
  console.log("Minting tokens using admin:", admin.address);

  // 3. On "attache" chaque contrat
  const Chicken = await ethers.getContractFactory("Chicken");
  const Sheep = await ethers.getContractFactory("Sheep");
  const Elephant = await ethers.getContractFactory("Elephant");

  const chicken = Chicken.attach(data.Chicken);
  const sheep = Sheep.attach(data.Sheep);
  const elephant = Elephant.attach(data.Elephant);

  // 4. Minter 3 Chickens
  console.log("=== Minting 3 Chickens ===");
  for (let i = 1; i <= 3; i++) {
    const name = `Chicken #${i}`;
    const ipfsHash = "QmFakeHashChicken";
    const tx = await chicken.mintChicken(admin.address, name, ipfsHash);
    await tx.wait(); // Ethers v6
    console.log(`Minted Chicken #${i} to ${admin.address}`);
  }

  // 5. Minter 3 Sheeps
  console.log("=== Minting 3 Sheeps ===");
  for (let i = 1; i <= 3; i++) {
    const name = `Sheep #${i}`;
    const ipfsHash = "QmFakeHashSheep";
    const tx = await sheep.mintSheep(admin.address, name, ipfsHash);
    await tx.wait();
    console.log(`Minted Sheep #${i} to ${admin.address}`);
  }

  // 6. Minter 3 Elephants
  console.log("=== Minting 3 Elephants ===");
  for (let i = 1; i <= 3; i++) {
    const name = `Elephant #${i}`;
    const ipfsHash = "QmFakeHashElephant";
    const tx = await elephant.mintElephant(admin.address, name, ipfsHash);
    await tx.wait();
    console.log(`Minted Elephant #${i} to ${admin.address}`);
  }

  console.log("== Done: 3 tokens de chaque animal ont été mintés. ==");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

