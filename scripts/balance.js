require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  if (!process.env.PAYK_TOKEN_ADDRESS || !process.env.RECIPIENT_ADDRESS) {
    throw new Error("❗ PAYK_TOKEN_ADDRESS or RECIPIENT_ADDRESS is not set in .env file");
  }

  const [signer] = await ethers.getSigners();
  const payk = await ethers.getContractAt("PAYKToken", process.env.PAYK_TOKEN_ADDRESS, signer);

  const balance = await payk.balanceOf(process.env.RECIPIENT_ADDRESS);
  const formatted = Number(ethers.formatUnits(balance, 18)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  console.log(`📊 PAYK Balance of ${process.env.RECIPIENT_ADDRESS}: ${formatted} PAYK`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error checking balance:", error);
    process.exit(1);
  });