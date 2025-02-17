const hre = require("hardhat");

async function main() {
  const FarmCoin = await hre.ethers.getContractFactory("FarmCoin");
  const farmCoin = await FarmCoin.deploy();
  await farmCoin.waitForDeployment();
  console.log("FarmCoin déployé à :", farmCoin.target);

  const LivestockNFT = await hre.ethers.getContractFactory("LivestockNFT");
  const livestockNFT = await LivestockNFT.deploy(farmCoin.target);
  await livestockNFT.waitForDeployment();
  console.log("LivestockNFT déployé à :", livestockNFT.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});