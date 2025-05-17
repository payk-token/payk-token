require('dotenv').config();
const { ethers, upgrades } = require("hardhat");

async function main() {
  const PAYK = await ethers.getContractFactory("PAYKToken");
  const payk = await upgrades.deployProxy(PAYK, [], { initializer: "initialize" });

  await payk.deployed();
  console.log(`✅ PAYK deployed to: ${payk.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});