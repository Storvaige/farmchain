const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  // 1. takes 3 first signers
  const [admin, user1, user2] = await ethers.getSigners();

  console.log("Deploying with admin address:", admin.address);
  console.log("User1 address:", user1.address);
  console.log("User2 address:", user2.address);

  // 2. Deploy the Chicken contract
  const Chicken = await ethers.getContractFactory("Chicken");
  const chicken = await Chicken.deploy();
  await chicken.waitForDeployment(); // Ethers v6
  const chickenAddress = await chicken.getAddress();
  console.log("Chicken deployed to:", chickenAddress);

  // 3. Deploy the Sheep contract
  const Sheep = await ethers.getContractFactory("Sheep");
  const sheep = await Sheep.deploy();
  await sheep.waitForDeployment();
  const sheepAddress = await sheep.getAddress();
  console.log("Sheep deployed to:", sheepAddress);

  // 4. Deploy the Elephant contract
  const Elephant = await ethers.getContractFactory("Elephant");
  const elephant = await Elephant.deploy();
  await elephant.waitForDeployment();
  const elephantAddress = await elephant.getAddress();
  console.log("Elephant deployed to:", elephantAddress);

  // 5. Create (or update) the deployments/localhost.json file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filePath = path.join(deploymentsDir, "localhost.json");

  const data = {
    // Contract addresses
    Chicken: chickenAddress,
    Sheep: sheepAddress,
    Elephant: elephantAddress,
    // Signers’ addresses
    Admin: admin.address,
    User1: user1.address,
    User2: user2.address,
  };

  // 6. Write out the JSON file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Addresses saved to ${filePath}`);
}

// Standard Hardhat pattern for async main()
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
