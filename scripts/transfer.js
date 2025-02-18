// scripts/transfer.js
const hre = require("hardhat");
const addresses = require("../deployments/localhost.json");

async function main() {
  const [admin, user] = await hre.ethers.getSigners();
  const farmCoin = await hre.ethers.getContractAt("FarmCoin", addresses.FarmCoin);

  // Vérifier le nombre de décimales et définir le montant à transférer
  const decimals = await farmCoin.decimals();
  const amount = decimals === 18 
    ? hre.ethers.parseEther("100") // 100.0 FarmCoins pour 18 décimales
    : 100;                         // 100 FarmCoins pour 0 décimales

  console.log("Balance admin avant :", await getFormattedBalance(farmCoin, admin.address));
  console.log("Balance user avant  :", await getFormattedBalance(farmCoin, user.address));

  // Effectuer le transfert de FarmCoins de admin à user
  const tx = await farmCoin.connect(admin).transfer(user.address, amount);
  await tx.wait();

  console.log("\n✅ Transfert réussi !");
  console.log("Balance admin après :", await getFormattedBalance(farmCoin, admin.address));
  console.log("Balance user après  :", await getFormattedBalance(farmCoin, user.address));
}

async function getFormattedBalance(contract, address) {
  const balance = await contract.balanceOf(address);
  const decimals = await contract.decimals();
  return decimals === 18 
    ? hre.ethers.formatEther(balance) + " FARM" 
    : balance.toString() + " FARM";
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
