const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // 1) Read addresses from deployments/localhost.json
  const deploymentsDir = path.join(__dirname, "../deployments");
  const filePath = path.join(deploymentsDir, "localhost.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const chickenAddress = data.Chicken;
  const sheepAddress = data.Sheep;
  const exchangeAddress = data.AnimalExchange;

  // We assume that user1 will supply 3 chickens and user2 will supply 1 sheep.
  const [user1, user2] = await ethers.getSigners();

  console.log("Exchange script: user1 => 3 Chickens, user2 => 1 Sheep");
  console.log("Chicken contract at:", chickenAddress);
  console.log("Sheep contract at:", sheepAddress);
  console.log("Exchange contract at:", exchangeAddress);

  // 2) Attach to the contracts
  const Chicken = await ethers.getContractFactory("Chicken");
  const Sheep = await ethers.getContractFactory("Sheep");
  const AnimalExchange = await ethers.getContractFactory("AnimalExchange");

  const chicken = Chicken.attach(chickenAddress);
  const sheep = Sheep.attach(sheepAddress);
  const exchange = AnimalExchange.attach(exchangeAddress);

  // 3) Get token IDs from users' inventories
  async function getOwnedTokenIds(contract, ownerAddress, maxTokens) {
    const ownedTokens = [];
    for (let tokenId = 1; tokenId <= maxTokens; tokenId++) {
      try {
        const tokenOwner = await contract.ownerOf(tokenId);
        if (tokenOwner.toLowerCase() === ownerAddress.toLowerCase()) {
          ownedTokens.push(tokenId);
        }
      } catch (err) {
        // Token does not exist or other error, continue
      }
    }
    return ownedTokens;
  }

  const MAX_TOKENS = await chicken.MAX_TOKENS_PER_OWNER();
  const user1Chickens = await getOwnedTokenIds(chicken, user1.address, MAX_TOKENS);
  const user2Sheep = await getOwnedTokenIds(sheep, user2.address, MAX_TOKENS);

  console.log(`User1's chickens: ${user1Chickens}`);
  console.log(`User2's sheep: ${user2Sheep}`);

  if (user1Chickens.length < 3) {
    throw new Error(`User1 needs at least 3 chickens, but only has ${user1Chickens.length}`);
  }
  if (user2Sheep.length < 1) {
    throw new Error(`User2 needs at least 1 sheep, but has ${user2Sheep.length}`);
  }

  // Select the required token IDs:
  const selectedChickenTokenIds = user1Chickens.slice(0, 3);
  const selectedSheepTokenIds = user2Sheep.slice(0, 1);

  // 4) Approve the exchange contract to transfer tokens
  console.log("Approving tokens for exchange...");
  for (const tokenId of selectedChickenTokenIds) {
    await chicken.connect(user1).approve(exchangeAddress, tokenId);
  }
  for (const tokenId of selectedSheepTokenIds) {
    await sheep.connect(user2).approve(exchangeAddress, tokenId);
  }
  console.log("Tokens approved.");

  // 5) Call exchangeMultipleForMultiple to swap tokens
  console.log("\nSwapping 3 Chickens of user1 for 1 Sheep of user2...");
  const tx = await exchange.connect(user1).exchangeMultipleForMultiple(
    chickenAddress, selectedChickenTokenIds,
    sheepAddress, selectedSheepTokenIds
  );
  await tx.wait();
  console.log("Exchange done!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
