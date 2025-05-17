const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  const phoneNumber = process.env.TEST_PHONE_NUMBER;
  const recipientAddress = process.env.RECIPIENT_ADDRESS;
  const salt = process.env.SALT || "default_salt";

  if (!phoneNumber || !recipientAddress) {
    console.error('❌ Missing environment variables');
    console.log({ phoneNumber, recipientAddress });
    return;
  }

  const [deployer] = await ethers.getSigners();

  console.log("📦 Deploying PhoneMappingRegistry with account:", deployer.address);

  const Registry = await ethers.getContractFactory("PhoneMappingRegistry");
  const registry = await Registry.deploy(deployer.address);

  await registry.deployed();

  console.log("✅ PhoneMappingRegistry deployed to:", registry.address);

  const phoneHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["string", "string"], [salt, phoneNumber])
  );
  console.log(`📲 Setting mapping for phone hash: ${phoneHash}`);

  const tx = await registry.setMapping(phoneHash, recipientAddress);
  await tx.wait();

  console.log(`✅ Mapping set successfully. TxHash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});