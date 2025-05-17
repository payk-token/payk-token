require('dotenv').config();
const { OdisUtils } = require('@celo/identity');
const { newKit } = require('@celo/contractkit');

const PHONE_NUMBER = process.env.TEST_PHONE_NUMBER;
const ACCOUNT_ADDRESS = process.env.RECIPIENT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ODIS_PUBLIC_KEY = process.env.ODIS_PUB_KEY_BASE64;

// 👉 Ставимо тут актуальний endpoint:
const ODIS_URL = 'https://alfajores-odis-v2.celo.org';

async function mapPhoneWithWalletKey() {
    const kit = newKit(process.env.ALFAJORES_RPC_URL);
    kit.connection.addAccount(PRIVATE_KEY);

    const authSigner = {
        authenticationMethod: OdisUtils.Query.AuthenticationMethod.WALLET_KEY,
        contractKit: kit,
    };

    const serviceContext = {
        odisUrl: ODIS_URL,
        odisPubKey: ODIS_PUBLIC_KEY,
    };

    console.log('📢 Using WalletKey authentication');
    console.log('📢 Using serviceContext:', serviceContext);

    try {
        const response = await OdisUtils.PhoneNumberIdentifier.getPhoneNumberIdentifier(
            PHONE_NUMBER,
            ACCOUNT_ADDRESS,
            authSigner,
            serviceContext
        );

        console.log(`✅ Phone Hash: ${response.phoneHash}`);
        console.log(`✅ Pepper: ${response.pepper}`);
    } catch (error) {
        console.error('❌ Failed to map phone number:', error);
    }
}

mapPhoneWithWalletKey();