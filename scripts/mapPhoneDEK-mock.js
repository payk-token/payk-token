require('dotenv').config();

const MOCK_PHONE_HASH = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
const MOCK_PEPPER = "pepper123";

async function mapPhoneMock() {
    console.log('🟡 [MOCK MODE] Using static phoneHash & pepper values');
    console.log(`✅ Phone Hash: ${MOCK_PHONE_HASH}`);
    console.log(`✅ Pepper: ${MOCK_PEPPER}`);

    // Тут можна одразу викликати контрактний метод з цим phoneHash, якщо треба.
    // Наприклад: await myContract.savePhoneHash(MOCK_PHONE_HASH, ...);
}

mapPhoneMock();