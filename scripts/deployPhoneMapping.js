const { ethers, upgrades } = require("hardhat");

async function main() {
  const PAYKToken = await ethers.getContractFactory("PAYKToken");

  console.log("Deploying PAYK token...");
  const payk = await upgrades.deployProxy(PAYKToken, [], { initializer: 'initialize' });

  await payk.deployed();

  console.log("✅ PAYK deployed to:", payk.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});