const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  // 1) Read deployments/localhost.json for Chicken, Admin, and User1 addresses
  const deploymentsDir = path.join(__dirname, "../deployments");
  const filePath = path.join(deploymentsDir, "localhost.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}. Deploy your contracts first!`);
  }

  // Parse the JSON
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  // e.g. data.Chicken, data.Admin, data.User1

  if (!data.Chicken || !data.Admin || !data.User1) {
    throw new Error("Missing Chicken, Admin, or User1 address in localhost.json");
  }

  const chickenAddress = data.Chicken;
  const adminAddress = data.Admin;
  const user1Address = data.User1;

  // 2) Get the Signers from Hardhat
  //    We'll find the admin Signer that matches data.Admin
  //    then we’ll attach the Chicken contract & do the transfer
  const signers = await ethers.getSigners();

  // We want the Signer whose address matches data.Admin
  const adminSigner = signers.find((s) => s.address.toLowerCase() === adminAddress.toLowerCase());
  if (!adminSigner) {
    throw new Error(`No Hardhat signer found matching Admin address: ${adminAddress}`);
  }

  console.log("Admin signer found:", adminSigner.address);
  console.log("User1 address:", user1Address);

  // 3) Attach to the Chicken contract
  const ChickenFactory = await ethers.getContractFactory("Chicken", adminSigner);
  const chicken = ChickenFactory.attach(chickenAddress);
  console.log("Using Chicken contract at:", chickenAddress);

  // 4) Transfer a specific Chicken tokenId (e.g. #1)
  const TOKEN_ID = 1;
  console.log(`Transferring Chicken token #${TOKEN_ID} from Admin to User1...`);

  const tx = await chicken.transferFrom(adminSigner.address, user1Address, TOKEN_ID);
  await tx.wait();

  console.log(`Successfully transferred Chicken #${TOKEN_ID} from ${adminSigner.address} to ${user1Address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
