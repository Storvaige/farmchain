// scripts/listAnimals.js
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  // 1) Lecture du fichier deployments/localhost.json
  const deploymentsDir = path.join(__dirname, "../deployments");
  const filePath = path.join(deploymentsDir, "localhost.json");

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}. Deploy your contracts first!`);
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  // data.Chicken, data.Sheep, data.Elephant

  // 2) Récupération du Signer admin (celui qui a déployé)
  const [admin] = await ethers.getSigners();
  console.log("Listing all animals for admin:", admin.address);

  // 3) On attache chaque contrat à son adresse déployée
  const Chicken = await ethers.getContractFactory("Chicken");
  const Sheep   = await ethers.getContractFactory("Sheep");
  const Elephant= await ethers.getContractFactory("Elephant");

  const chicken  = Chicken.attach(data.Chicken);
  const sheep    = Sheep.attach(data.Sheep);
  const elephant = Elephant.attach(data.Elephant);

  // 4) Helper : lister les tokens pour un contrat donné
  async function listTokensForOwner(contract, contractName, ownerAddress, maxTokens=3) {
    console.log(`\n=== Listing up to ${maxTokens} tokens for ${contractName} ===`);
    for (let tokenId = 1; tokenId <= maxTokens; tokenId++) {
      try {
        const tokenOwner = await contract.ownerOf(tokenId);
        if (tokenOwner === ownerAddress) {
            const meta = await contract.getResourceMetadata(tokenId);
            try {
                const createdDate = meta.createdAt ? new Date(Number(meta.createdAt) * 1000).toISOString() : 'N/A';
                const transferDate = meta.lastTransferAt ? new Date(Number(meta.lastTransferAt) * 1000).toISOString() : 'N/A';
                const ownersHistoryStr = Array.isArray(meta.ownersHistory) ? meta.ownersHistory.join(", ") : 'No history';

                console.log(`Token #${tokenId}:`);
                console.log(`  Name:   ${meta.name || 'N/A'}`);
                console.log(`  Type:   ${meta.resourceType || 'N/A'}`);
                console.log(`  Value:  ${meta.value || 'N/A'}`);
                console.log(`  IPFS:   ${meta.ipfsHash || 'N/A'}`);
                console.log(`  CreatedAt:      ${createdDate}`);
                console.log(`  LastTransferAt: ${transferDate}`);
                console.log(`  ownersHistory: ${ownersHistoryStr}`);
            } catch (err) {
                console.error(`Error formatting metadata for token #${tokenId}:`, err);
                console.log(meta);
            }
        }
      } catch (err) {
        // ownerOf(tokenId) revert si le token n'existe pas.
      }
    }
  }

  // 5) Lister pour chaque type d’animal (Chicken, Sheep, Elephant)
  await listTokensForOwner(chicken,  "Chicken",  admin.address, 3);
  await listTokensForOwner(sheep,    "Sheep",    admin.address, 3);
  await listTokensForOwner(elephant, "Elephant", admin.address, 3);

  console.log("\n== Done listing tokens for admin. ==");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
