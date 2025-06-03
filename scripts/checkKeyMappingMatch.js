import Web3 from "web3";
import { keccak256, defaultAbiCoder } from "ethers/lib/utils.js";
import dotenv from "dotenv";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const registryAbi = require("../artifacts/contracts/PhoneMappingRegistry.sol/PhoneMappingRegistry.json");

dotenv.config({ path: ".env.keys" });

const web3 = new Web3("https://alfajores-forno.celo-testnet.org");

// 🔐 Приватний ключ і номер для перевірки
const PRIVATE_KEY = process.env.PRIVATE_KEY_380989737510;
const PHONE = "+380989737510";
const SALT = "CELO";

// 🔁 Отримати адресу з приватного ключа
const wallet = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
const derivedAddress = wallet.address;
console.log(`🔐 Address from private key: ${derivedAddress}`);

// 📲 Отримати адресу з мапінгу
const phoneHash = keccak256(defaultAbiCoder.encode(["string", "string"], [SALT, PHONE]));
const contractAddress = process.env.PHONE_MAPPING_REGISTRY_ADDRESS || "0x300e7d225A141A20e00C1F375Dd99a32b0329758";
const phoneRegistry = new web3.eth.Contract(registryAbi.abi, contractAddress);

const mappedAddress = await phoneRegistry.methods.getMapping(phoneHash).call();
console.log(`📲 Address from mapping for ${PHONE}: ${mappedAddress}`);

// ✅ Перевірка відповідності
if (derivedAddress.toLowerCase() === mappedAddress.toLowerCase()) {
  console.log("✅ Match! Приватний ключ відповідає мапінгу");
} else {
  console.log("❌ Не збігається! Інша адреса записана в реєстрі");
}