const hre = require("hardhat");
const addresses = require("../deployments/localhost.json");

async function main() {
  // Supposons que l'admin est le premier compte
  const [admin] = await hre.ethers.getSigners();

  // Récupérer les instances des trois contrats
  const farmCoin = await hre.ethers.getContractAt("FarmCoin", addresses.FarmCoin);
  const chickenCoin = await hre.ethers.getContractAt("ChickenCoin", addresses.ChickenCoin);
  const elephantCoin = await hre.ethers.getContractAt("ElephantCoin", addresses.ElephantCoin);

  // Obtenir les soldes pour l'admin
  const farmBalance = await farmCoin.balanceOf(admin.address);
  const chickenBalance = await chickenCoin.balanceOf(admin.address);
  const elephantBalance = await elephantCoin.balanceOf(admin.address);

  console.log(`Balances for admin (${admin.address}):`);
  console.log(`- FarmCoin: ${farmBalance.toString()}`);
  console.log(`- ChickenCoin: ${chickenBalance.toString()}`);
  console.log(`- ElephantCoin: ${elephantBalance.toString()}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
