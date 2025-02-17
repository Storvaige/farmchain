const hre = require("hardhat");
const addresses = require("../deployments/localhost.json");

async function main() {
  const [admin, user] = await hre.ethers.getSigners();
  const farmCoin = await hre.ethers.getContractAt("FarmCoin", addresses.FarmCoin);
  const livestockNFT = await hre.ethers.getContractAt("LivestockNFT", addresses.LivestockNFT);

  // Mint des FarmCoins pour l'admin
  await farmCoin.mint(admin.address, 1000);
  console.log("Balance admin :", await farmCoin.balanceOf(admin.address));
  console.log("Balance user :", await farmCoin.balanceOf(user.address));

  // Mint d'une vache
  await livestockNFT.mint(2); // 2 = Vache
  console.log("NFTs de l'admin :", await livestockNFT.balanceOf(admin.address));
  console.log("NFTs de l'user :", await livestockNFT.balanceOf(user.address));
}

main();