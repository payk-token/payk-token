import dotenv from "dotenv";
import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import { utils as ethersUtils } from "ethers";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// ⬇️ Завантаження змінних з .env.keys
dotenv.config({ path: ".env.keys" });

// ⬇️ Перевірка критичних змінних
if (!process.env.ALFAJORES_RPC_URL) throw new Error("❌ ALFAJORES_RPC_URL відсутній");
if (!process.env.PRIVATE_KEY) throw new Error("❌ PRIVATE_KEY відсутній");
if (!process.env.PHONE_MAPPING_REGISTRY_ADDRESS) throw new Error("❌ PHONE_MAPPING_REGISTRY_ADDRESS відсутній");
if (!process.env.TEST_PHONE_NUMBER) throw new Error("❌ TEST_PHONE_NUMBER відсутній");
if (!process.env.RECIPIENT_ADDRESS) throw new Error("❌ RECIPIENT_ADDRESS відсутній");

// ⬇️ Ініціалізація Web3 + Kit
const web3 = new Web3(process.env.ALFAJORES_RPC_URL);
const kit = newKitFromWeb3(web3);
kit.addAccount(process.env.PRIVATE_KEY);

// ⬇️ Дані
const senderAddress = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY).address;
const registryAbi = require("../artifacts/contracts/PhoneMappingRegistry.sol/PhoneMappingRegistry.json");
const phoneRegistry = new kit.web3.eth.Contract(
  registryAbi.abi,
  process.env.PHONE_MAPPING_REGISTRY_ADDRESS
);
const phone = "+380989737510";
const recipient = "0xee0B24f1ce6484a77032590B8B002AA0Efb9026A";
const salt = "CELO";

async function main() {
  try {
    console.log("Using PRIVATE_KEY:", process.env.PRIVATE_KEY);
    console.log("Using TEST_PHONE_NUMBER:", phone);
    console.log("Using RECIPIENT_ADDRESS:", recipient);

    const phoneHash = ethersUtils.keccak256(
      ethersUtils.defaultAbiCoder.encode(["string", "string"], [salt, phone])
    );

    console.log(`📞 Mapping phone ${phone} → hash ${phoneHash}`);

    const tx = await phoneRegistry.methods.setMapping(phoneHash, recipient).send({
      from: senderAddress,
    });

    console.log(`✅ Successfully mapped ${phone} to ${recipient}`);
    console.log(`🔗 Tx hash: ${tx.transactionHash}`);
  } catch (err) {
    console.error("❌ Failed to map phone number:", err);
  }
}

main();