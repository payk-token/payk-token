const { ethers } = require('ethers');
const { computePublicKey } = require('@ethersproject/signing-key');
const fs = require('fs');
const path = require('path');

async function generateDEK() {
    const dekWallet = ethers.Wallet.createRandom();
    const privateKey = dekWallet.privateKey;
    const publicKey = dekWallet.publicKey;
    const compressedPublicKey = computePublicKey(privateKey, true);

    console.log("✅ DEK Private Key:", privateKey);
    console.log("✅ DEK Public Key (uncompressed):", publicKey);
    console.log("✅ DEK Public Key (compressed):", compressedPublicKey);

    const envPath = path.resolve(__dirname, '../.env');
    const envData = `\nDEK_PRIVATE_KEY=${privateKey}\nDEK_PUBLIC_KEY_COMPRESSED=${compressedPublicKey}\n`;

    fs.appendFileSync(envPath, envData);
    console.log(`✅ Keys successfully added to ${envPath}`);
}

generateDEK();