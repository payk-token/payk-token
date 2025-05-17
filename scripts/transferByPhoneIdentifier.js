require('dotenv').config();
const { ethers } = require("hardhat");
const { newKit } = require('@celo/contractkit');

// Mock Data
const mockIdentifier = {
  phoneHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  pepper: "pepper123"
};

const mockPhoneMapping = {
  "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890": "0x60cddA7f205F039Cdd88037348d1270Ab5d3985e"
};

async function main() {
  const PHONE_NUMBER = process.env.TEST_PHONE_NUMBER;
  const PAYK_TOKEN_ADDRESS = process.env.PAYK_TOKEN_ADDRESS;

  if (!PHONE_NUMBER || !PAYK_TOKEN_ADDRESS) {
    console.error('❌ Missing env variables');
    return;
  }

  const kit = newKit(process.env.ALFAJORES_RPC_URL);
  const accounts = await kit.web3.eth.getAccounts();
  kit.defaultAccount = accounts[0];

  let phoneHash, pepper;

  if (process.env.USE_MOCK === 'true') {
    console.log(`📲 [MOCK] Using static phoneHash for phone: ${PHONE_NUMBER}`);
    phoneHash = mockIdentifier.phoneHash;
    pepper = mockIdentifier.pepper;
  } else {
    const { OdisUtils } = require('@celo/identity');

    const authSigner = {
      authenticationMethod: OdisUtils.Query.AuthenticationMethod.ENCRYPTION_KEY,
      rawKey: process.env.DEK_PRIVATE_KEY,
    };

    const serviceContext = {
      odisUrl: process.env.ODIS_URL,
      odisPubKey: process.env.ODIS_PUB_KEY_BASE64,
    };

    console.log(`📲 Querying ODIS for phone identifier of ${PHONE_NUMBER}...`);

    try {
      const response = await OdisUtils.PhoneNumberIdentifier.getPhoneNumberIdentifier(
        PHONE_NUMBER,
        kit.defaultAccount,
        authSigner,
        serviceContext
      );
      phoneHash = response.phoneHash;
      pepper = response.pepper;

      console.log(`✅ Phone Hash (ODIS): ${phoneHash}`);
      console.log(`✅ Pepper (ODIS): ${pepper}`);
    } catch (error) {
      console.error('❌ Failed to fetch phone identifier from ODIS:', error);
      return;
    }
  }

  console.log(`✅ Phone Hash: ${phoneHash}`);
  console.log(`✅ Pepper: ${pepper}`);

  const recipient = mockPhoneMapping[phoneHash];

  if (!recipient) {
    console.error('❌ No recipient found for this identifier');
    return;
  }

  console.log(`📤 Transferring PAYK to recipient: ${recipient}`);

  const payk = await ethers.getContractAt("PAYKToken", PAYK_TOKEN_ADDRESS);
  const amount = ethers.utils.parseUnits("10", 18); // 10 PAYK

  const tx = await payk.transfer(recipient, amount);
  await tx.wait();

  console.log(`✅ Transfer successful. TxHash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});