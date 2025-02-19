const fs = require("fs");
const path = require("path");

async function main() {
  const deploymentsDir = path.join(__dirname, "../deployments");
  const filePath = path.join(deploymentsDir, "localhost.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}. Deploy your contracts first!`);
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  console.log("chicken IPFS : http://127.0.0.1:8080/ipfs/" + data.ChickenCID);
  console.log("sheep IPFS : http://127.0.0.1:8080/ipfs/" + data.SheepCID);
  console.log("elephant IPFS : http://127.0.0.1:8080/ipfs/" + data.ElephantCID);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

