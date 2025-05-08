require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  if (!process.env.PAYK_TOKEN_ADDRESS || !process.env.BURN_AMOUNT) {
    throw new Error("Required environment variables are missing!");
  }

  const [signer] = await ethers.getSigners();
  const payk = await ethers.getContractAt("PAYKToken", process.env.PAYK_TOKEN_ADDRESS, signer);

  const burnAmount = ethers.parseUnits(process.env.BURN_AMOUNT.toString(), 18);
  const tx = await payk.burn(burnAmount);
  await tx.wait();

  console.log(`🔥 Successfully burned ${process.env.BURN_AMOUNT} PAYK tokens from ${await signer.getAddress()}`);

  const balance = await payk.balanceOf(await signer.getAddress());
  const formattedBalance = Number(ethers.formatUnits(balance, 18)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  console.log(`💰 New balance: ${formattedBalance} PAYK`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error during burning:', error);
    process.exit(1);
  });