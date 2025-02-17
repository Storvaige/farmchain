// scripts/deploy.js
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [admin, user] = await hre.ethers.getSigners(); // Récupère admin + un user

  // Déployer FarmCoin
  const FarmCoin = await hre.ethers.getContractFactory("FarmCoin");
  const farmCoin = await FarmCoin.deploy();
  await farmCoin.waitForDeployment();

  // ✅ Mint 100 000 FarmCoins à l'admin
  await farmCoin.mint(admin.address, 100000);
  console.log("✅ 100 000 FarmCoins mintés pour l'admin");

  // Déployer LivestockNFT
  const LivestockNFT = await hre.ethers.getContractFactory("LivestockNFT");
  const livestockNFT = await LivestockNFT.deploy(farmCoin.target);
  await livestockNFT.waitForDeployment();

  // Sauvegarder les adresses
  const addresses = {
    FarmCoin: farmCoin.target,
    LivestockNFT: livestockNFT.target,
  };
  fs.writeFileSync("./deployments/localhost.json", JSON.stringify(addresses, null, 2));

  // ✅ Afficher les balances
  console.log("👨💼 Balance Admin :", await farmCoin.balanceOf(admin.address));
  console.log("👤 Balance User :", await farmCoin.balanceOf(user.address)); // Doit être 0
}

main().catch(/* ... */);