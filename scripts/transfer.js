const hre = require("hardhat");
const addresses = require("../deployments/localhost.json");

async function main() {
  const [admin, user] = await hre.ethers.getSigners(); // Récupère admin + user
  const farmCoin = await hre.ethers.getContractAt("FarmCoin", addresses.FarmCoin);

  // ✅ 1. Vérifier le nombre de décimales
  const decimals = await farmCoin.decimals();
  const amount = decimals === 18 
    ? hre.ethers.parseEther("100") // 100.0 FarmCoins (18 décimales)
    : 100;                         // 100 FarmCoins (0 décimales)

  // ✅ 2. Effectuer le transfert
  console.log("Balance admin avant :", await getFormattedBalance(farmCoin, admin.address));
  console.log("Balance user avant  :", await getFormattedBalance(farmCoin, user.address));

  const tx = await farmCoin.connect(admin).transfer(user.address, amount);
  await tx.wait();

  // ✅ 3. Vérifier les nouveaux soldes
  console.log("\n✅ Transfert réussi !");
  console.log("Balance admin après :", await getFormattedBalance(farmCoin, admin.address));
  console.log("Balance user après  :", await getFormattedBalance(farmCoin, user.address));
}

// Fonction utilitaire pour formater le solde
async function getFormattedBalance(contract, address) {
  const balance = await contract.balanceOf(address);
  const decimals = await contract.decimals();
  return decimals === 18 
    ? hre.ethers.formatEther(balance) + " FARM" 
    : balance.toString() + " FARM";
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});