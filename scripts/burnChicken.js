const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  // 1) Lire le fichier deployments/localhost.json pour obtenir les adresses de Chicken, Admin et User1
  const deploymentsDir = path.join(__dirname, "../deployments");
  const filePath = path.join(deploymentsDir, "localhost.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}. Deploy your contracts first!`);
  }

  // Parse le JSON
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  // e.g. data.Chicken, data.Admin, data.User1

  if (!data.Chicken || !data.Admin || !data.User1) {
    throw new Error("Missing Chicken, Admin, or User1 address in localhost.json");
  }

  const chickenAddress = data.Chicken;
  const adminAddress = data.Admin;
  const user1Address = data.User1;

  // 2) Obtenir les Signers de Hardhat
  //    Nous allons trouver le Signer admin qui correspond à data.Admin
  //    puis nous attacherons le contrat Chicken et effectuerons la brûlure
  const signers = await ethers.getSigners();

  // Nous voulons le Signer dont l'adresse correspond à data.Admin
  const adminSigner = signers.find((s) => s.address.toLowerCase() === adminAddress.toLowerCase());
  if (!adminSigner) {
    throw new Error(`No Hardhat signer found matching Admin address: ${adminAddress}`);
  }

  console.log("Admin signer found:", adminSigner.address);
  console.log("User1 address:", user1Address);

  // 3) Attacher le contrat Chicken
  const ChickenFactory = await ethers.getContractFactory("Chicken", adminSigner);
  const chicken = ChickenFactory.attach(chickenAddress);
  console.log("Using Chicken contract at:", chickenAddress);

  // 4) Brûler un token Chicken spécifique (e.g. #1)
  const TOKEN_ID = 2;
  console.log(`Burning Chicken token #${TOKEN_ID}...`);

  const tx = await chicken.burnResource(TOKEN_ID);
  await tx.wait();

  console.log(`Successfully burned Chicken #${TOKEN_ID}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});