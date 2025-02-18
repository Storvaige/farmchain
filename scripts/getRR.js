const hre = require("hardhat");
const addresses = require("../deployments/localhost.json");

async function main() {
  // Récupérer le ResourceRegistry déployé
  const resourceRegistry = await hre.ethers.getContractAt("ResourceRegistry", addresses.ResourceRegistry);
  
  // Obtenir le nombre total de ressources enregistrées
  const nextResourceId = await resourceRegistry.nextResourceId();
  console.log(`Total resources: ${nextResourceId.toString()}`);
  
  // Boucler sur chaque ressource et afficher ses métadonnées
  for (let i = 0; i < nextResourceId; i++) {
    const resource = await resourceRegistry.getResource(i);
    
    console.log(`\nResource ID: ${i}`);
    console.log(`  Name: ${resource.name}`);
    console.log(`  Type: ${resource.resourceType}`);
    console.log(`  Value: ${resource.value.toString()}`);
    console.log(`  IPFS Hash: ${resource.ipfsHash}`);
    console.log(`  Previous Owners: ${resource.previousOwners}`);
    // Convertir les timestamps en date lisible
    const createdAt = new Date(Number(resource.createdAt) * 1000).toLocaleString();
    const lastTransferAt = new Date(Number(resource.lastTransferAt) * 1000).toLocaleString();
    console.log(`  Created At: ${createdAt}`);
    console.log(`  Last Transfer At: ${lastTransferAt}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
