require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  if (!process.env.PAYK_TOKEN_ADDRESS || !process.env.RECIPIENT_ADDRESS || !process.env.MINT_AMOUNT) {
    throw new Error("Required environment variables are missing!");
  }

  const [signer] = await ethers.getSigners();
  const payk = await ethers.getContractAt("PAYKToken", process.env.PAYK_TOKEN_ADDRESS, signer);

  const mintAmount = ethers.parseUnits(process.env.MINT_AMOUNT.toString(), 18);
  const tx = await payk.mint(process.env.RECIPIENT_ADDRESS, mintAmount);
  await tx.wait();

  console.log(`🎯 Successfully minted ${process.env.MINT_AMOUNT} PAYK tokens to ${process.env.RECIPIENT_ADDRESS}`);

  const balance = await payk.balanceOf(process.env.RECIPIENT_ADDRESS);
  const formattedBalance = Number(ethers.formatUnits(balance, 18)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  console.log(`💰 New balance: ${formattedBalance} PAYK`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error during minting:', error);
    process.exit(1);
  });