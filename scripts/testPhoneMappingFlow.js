require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  const registryAddress = process.env.PHONE_MAPPING_REGISTRY_ADDRESS;
  const tokenAddress = process.env.PAYK_TOKEN_ADDRESS;
  const phoneHash = process.env.TEST_PHONE_HASH;
  // Validate TEST_PHONE_HASH presence and hex format
  if (!phoneHash || !ethers.utils.isHexString(phoneHash)) {
    console.error("❌ TEST_PHONE_HASH is not set correctly in .env (should be a valid hex string)");
    return;
  }

  const transferAmount = ethers.utils.parseUnits("10", 18);

  if (!registryAddress || registryAddress.includes("your_registry_contract_address_here")) {
    console.error("❌ PHONE_MAPPING_REGISTRY_ADDRESS is not set in .env");
    return;
  }

  console.log(`📲 Looking up recipient by phoneHash: ${phoneHash}`);

  const [deployer] = await ethers.getSigners();
  const registry = await ethers.getContractAt("PhoneMappingRegistry", registryAddress, deployer);
  const recipient = await registry.getMapping(phoneHash);

  if (recipient === ethers.constants.AddressZero) {
    console.error("❌ No recipient found for this identifier in Registry");
    return;
  }

  console.log(`✅ Found recipient: ${recipient}`);

  const token = await ethers.getContractAt("PAYKToken", tokenAddress, deployer);

  console.log(`📤 Transferring 10 PAYK to ${recipient}...`);
  const tx = await token.transfer(recipient, transferAmount);
  await tx.wait();

  console.log(`✅ Transfer successful. TxHash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});