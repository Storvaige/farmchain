const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [admin, user] = await hre.ethers.getSigners();

  // 1. Déployer FarmCoin
  const FarmCoin = await hre.ethers.getContractFactory("FarmCoin");
  const farmCoin = await FarmCoin.deploy();
  await farmCoin.waitForDeployment();
  const farmCoinAddress = await farmCoin.getAddress();
  console.log("FarmCoin deployed at", await farmCoin.getAddress());

  const totalFarmCoinsToMint = 15500; // 15000 pour conversion + 500 restants
  await farmCoin.mint(admin.address, totalFarmCoinsToMint);
  console.log(`✅ Minted ${totalFarmCoinsToMint} FarmCoins to admin`);

  // 2. Déployer ChickenCoin
  const ChickenCoin = await hre.ethers.getContractFactory("ChickenCoin");
  const chickenCoin = await ChickenCoin.deploy(farmCoinAddress);
  await chickenCoin.waitForDeployment();
  const chickenCoinAddress = await chickenCoin.getAddress();
  console.log("ChickenCoin deployed at", chickenCoinAddress);

  // 3. Déployer ElephantCoin
  const ElephantCoin = await hre.ethers.getContractFactory("ElephantCoin");
  const elephantCoin = await ElephantCoin.deploy(chickenCoinAddress);
  await elephantCoin.waitForDeployment();
  const elephantCoinAddress = await elephantCoin.getAddress();
  console.log("ElephantCoin deployed at", elephantCoinAddress);


  // 4. Déployer ResourceRegistry
  const ResourceRegistry = await hre.ethers.getContractFactory("ResourceRegistry");
  const resourceRegistry = await ResourceRegistry.deploy();
  await resourceRegistry.waitForDeployment();
  const resourceRegistryAddress = await resourceRegistry.getAddress();
  console.log("ResourceRegistry deployed at", resourceRegistryAddress);


  // 5. Configurer chaque contrat pour utiliser le ResourceRegistry
  await farmCoin.setResourceRegistry(resourceRegistryAddress);
  await chickenCoin.setResourceRegistry(resourceRegistryAddress);
  await elephantCoin.setResourceRegistry(resourceRegistryAddress);
  console.log("✅ ResourceRegistry set on all coin contracts");

  // 6. L'admin approuve le contrat ChickenCoin pour transférer 15000 FarmCoins
  const requiredFarmForChicken = 15 * 1000; // 15000 FarmCoins pour 15 ChickenCoins
  let tx = await farmCoin.connect(admin).approve(chickenCoinAddress, requiredFarmForChicken);
  await tx.wait();
  console.log(`✅ Admin approved ${requiredFarmForChicken} FarmCoins for ChickenCoin conversion`);

  // 7. Mint 15 ChickenCoins pour l'admin (15000 FarmCoins seront transférés)
  tx = await chickenCoin.connect(admin).mintChicken(15);
  await tx.wait();
  console.log("✅ Minted 15 ChickenCoins for admin");

  // 8. Sauvegarder les adresses des contrats
  const addresses = {
    FarmCoin: farmCoinAddress,
    ChickenCoin: chickenCoinAddress,
    ElephantCoin: elephantCoinAddress,
    ResourceRegistry: resourceRegistryAddress
  };
  fs.writeFileSync("./deployments/localhost.json", JSON.stringify(addresses, null, 2));
  console.log("✅ Contract addresses saved");

  // 9. Afficher les balances de l'admin
  const adminFarmBalance = await farmCoin.balanceOf(admin.address);
  const adminChickenBalance = await chickenCoin.balanceOf(admin.address);
  console.log(`👨💼 Admin FarmCoin Balance: ${adminFarmBalance.toString()}`);
  console.log(`👨💼 Admin ChickenCoin Balance: ${adminChickenBalance.toString()}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
