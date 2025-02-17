const hre = require("hardhat");
const addresses = require("../deployments/localhost.json");

async function main() {
  const [account] = await hre.ethers.getSigners();
  const farmCoin = await hre.ethers.getContractAt("FarmCoin", addresses.FarmCoin);

  const balance = await farmCoin.balanceOf(account.address);
  console.log(`Balance de ${account.address} :`, balance.toString());
}

main();