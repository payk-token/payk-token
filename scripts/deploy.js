require("dotenv").config();
const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
  const PAYKToken = await hre.ethers.getContractFactory("PAYKToken");
  const payk = await upgrades.deployProxy(PAYKToken, [], { initializer: 'initialize' });
  await payk.waitForDeployment();

  console.log(`✅ PAYKToken deployed to ${await payk.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error during deployment:', error);
    process.exit(1);
  });