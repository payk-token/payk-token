require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  const PAYK_ADDRESS = process.env.PAYK_TOKEN_ADDRESS;
  const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS;

  if (!PAYK_ADDRESS || !RECIPIENT_ADDRESS) {
    console.error("❌ Missing PAYK_TOKEN_ADDRESS or RECIPIENT_ADDRESS in .env");
    return;
  }

  const payk = await ethers.getContractAt("PAYKToken", PAYK_ADDRESS);

  const amount = ethers.utils.parseUnits("10", 18); // 10 PAYK

  console.log(`📤 Transferring ${amount.toString()} PAYK to ${RECIPIENT_ADDRESS}...`);
  const tx = await payk.transfer(RECIPIENT_ADDRESS, amount);
  await tx.wait();

  console.log(`✅ Transfer successful. TxHash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});