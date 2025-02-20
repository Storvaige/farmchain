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

  const maxTokenz = await chicken.MAX_TOKENS_PER_OWNER();

  // 4) Helper : lister les tokens pour un contrat donné
  async function listTokensForOwner(contract, contractName, ownerAddress, maxTokens=maxTokenz) {
    const green = '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(`${green}\n=== Listing up to ${maxTokens} tokens for ${contractName} ===${reset}`);
    let foundTokens = false;
    let tokenCount = 0;
    for (let tokenId = 1; tokenId <= maxTokens; tokenId++) {
        try {
            const tokenOwner = await contract.ownerOf(tokenId);
            if (tokenOwner === ownerAddress) {
                foundTokens = true;
                tokenCount++;
                const meta = await contract.getResourceMetadata(tokenId);
                try {
                    const createdDate = meta.createdAt ? new Date(Number(meta.createdAt) * 1000).toISOString() : 'N/A';
                    const transferDate = meta.lastTransferAt ? new Date(Number(meta.lastTransferAt) * 1000).toISOString() : 'N/A';
                    const ownersHistoryStr = Array.isArray(meta.ownersHistory) ? meta.ownersHistory.join(", ") : 'No history';

                    console.log(`${green}Token #${tokenId}:${reset}`);
                    console.log(`${green}  Name:   ${meta.name || 'N/A'}${reset}`);
                    console.log(`${green}  Type:   ${meta.resourceType || 'N/A'}${reset}`);
                    console.log(`${green}  Value:  ${meta.value || 'N/A'}${reset}`);
                    console.log(`${green}  IPFS:   ${meta.ipfsHash || 'N/A'}${reset}`);
                    console.log(`${green}  CreatedAt:      ${createdDate}${reset}`);
                    console.log(`${green}  LastTransferAt: ${transferDate}${reset}`);
                    console.log(`${green}  ownersHistory: ${ownersHistoryStr}${reset}`);
                } catch (err) {
                    console.error(`Error formatting metadata for token #${tokenId}:`, err);
                    console.log(meta);
                }
            }
        } catch (err) {
            // ownerOf(tokenId) revert si le token n'existe pas.
        }
    }
    if (!foundTokens) {
        console.error(`${green}No tokens found for ${contractName} owned by ${ownerAddress}${reset}`);
    }
    return tokenCount;
  }

  // 5) Lister pour chaque type d’animal (Chicken, Sheep, Elephant)
  const chickenCount = await listTokensForOwner(chicken,  "Chicken",  admin.address, maxTokenz);
  const sheepCount   = await listTokensForOwner(sheep,    "Sheep",    admin.address, maxTokenz);
  const elephantCount= await listTokensForOwner(elephant, "Elephant", admin.address, maxTokenz);

  // 6) Afficher le solde de l'utilisateur et son équivalence
  console.log("\n== User Balance ==");
  console.log(`Chickens: ${chickenCount}`);
  console.log(`Sheep: ${sheepCount}`);
  console.log(`Elephants: ${elephantCount}`);

  console.log("\n== Done listing tokens for admin. ==");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});