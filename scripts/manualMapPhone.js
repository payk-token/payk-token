import dotenv from "dotenv";
import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import { utils as ethersUtils } from "ethers";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

dotenv.config();

const registryAbi = require("../artifacts/contracts/PhoneMappingRegistry.sol/PhoneMappingRegistry.json");

const web3 = new Web3(process.env.ALFAJORES_RPC_URL);
const kit = newKitFromWeb3(web3);
kit.addAccount(process.env.PRIVATE_KEY);

const senderAddress = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY).address;
const phoneRegistry = new kit.web3.eth.Contract(
  registryAbi.abi,
  process.env.PHONE_MAPPING_REGISTRY_ADDRESS
);

const phone = process.env.TEST_PHONE_NUMBER;
const recipient = process.env.RECIPIENT_ADDRESS;
const salt = "CELO";

async function main() {
  try {
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