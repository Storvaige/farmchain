const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  // 1) Lire le fichier deployments/localhost.json pour les adresses Chicken, Sheep, Elephant, Admin et User1
  const deploymentsDir = path.join(__dirname, "../deployments");
  const filePath = path.join(deploymentsDir, "localhost.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier non trouvé : ${filePath}. Déployez d'abord vos contrats !`);
  }

  // Parse le JSON
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (!data.Chicken || !data.Sheep || !data.Elephant || !data.Admin || !data.User1) {
    throw new Error("Adresses Chicken, Sheep, Elephant, Admin ou User1 manquantes dans localhost.json");
  }

  const chickenAddress = data.Chicken;
  const sheepAddress = data.Sheep;
  const elephantAddress = data.Elephant;
  const adminAddress = data.Admin;
  const user1Address = data.User1;

  // 2) Obtenir les Signers de Hardhat
  const signers = await ethers.getSigners();
  const adminSigner = signers.find((s) => s.address.toLowerCase() === adminAddress.toLowerCase());
  if (!adminSigner) {
    throw new Error(`Aucun signer Hardhat trouvé correspondant à l'adresse Admin : ${adminAddress}`);
  }

  console.log("Signer Admin trouvé :", adminSigner.address);
  console.log("Adresse User1 :", user1Address);

  // 3) Attacher les contrats Chicken, Sheep et Elephant
  const ChickenFactory = await ethers.getContractFactory("Chicken", adminSigner);
  const chicken = ChickenFactory.attach(chickenAddress);
  console.log("Utilisation du contrat Chicken à :", chickenAddress);

  const SheepFactory = await ethers.getContractFactory("Sheep", adminSigner);
  const sheep = SheepFactory.attach(sheepAddress);
  console.log("Utilisation du contrat Sheep à :", sheepAddress);

  const ElephantFactory = await ethers.getContractFactory("Elephant", adminSigner);
  const elephant = ElephantFactory.attach(elephantAddress);
  console.log("Utilisation du contrat Elephant à :", elephantAddress);

  // 4) Réaliser les échanges de tokens
  const CHICKEN_TOKEN_ID = 1;
  const SHEEP_TOKEN_ID = 1;
  const ELEPHANT_TOKEN_ID = 1;

  // Transférer 3 poulets pour 1 mouton
  console.log(`Transfert de 3 poulets pour 1 mouton...`);
  for (let i = 0; i < 3; i++) {
    const tx = await chicken.transferFrom(adminSigner.address, user1Address, CHICKEN_TOKEN_ID + i);
    await tx.wait();
    console.log(`Poulet #${CHICKEN_TOKEN_ID + i} transféré de ${adminSigner.address} à ${user1Address}`);
  }

  const txSheep = await sheep.transferFrom(adminSigner.address, user1Address, SHEEP_TOKEN_ID);
  await txSheep.wait();
  console.log(`Mouton #${SHEEP_TOKEN_ID} transféré de ${adminSigner.address} à ${user1Address}`);

  // Approuver l'adresse adminSigner pour transférer les tokens Sheep
  console.log(`Approbation de l'adresse adminSigner pour transférer les tokens Sheep...`);
  for (let i = 0; i < 3; i++) {
    const approveTx = await sheep.approve(adminSigner.address, SHEEP_TOKEN_ID + i);
    await approveTx.wait();
    console.log(`Token Sheep #${SHEEP_TOKEN_ID + i} approuvé pour transfert par ${adminSigner.address}`);
  }

  // Transférer 3 moutons pour 1 éléphant
  console.log(`Transfert de 3 moutons pour 1 éléphant...`);
  for (let i = 0; i < 3; i++) {
    const tx = await sheep.transferFrom(adminSigner.address, user1Address, SHEEP_TOKEN_ID + i);
    await tx.wait();
    console.log(`Mouton #${SHEEP_TOKEN_ID + i} transféré de ${adminSigner.address} à ${user1Address}`);
  }

  const txElephant = await elephant.transferFrom(adminSigner.address, user1Address, ELEPHANT_TOKEN_ID);
  await txElephant.wait();
  console.log(`Éléphant #${ELEPHANT_TOKEN_ID} transféré de ${adminSigner.address} à ${user1Address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});