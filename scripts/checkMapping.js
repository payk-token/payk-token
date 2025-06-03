const Web3 = require("web3");
const { utils: ethersUtils } = require("ethers");
const registryAbi = require("../artifacts/contracts/PhoneMappingRegistry.sol/PhoneMappingRegistry.json").abi;

// Підключаємося до Alfajores
const web3 = new Web3("https://alfajores-forno.celo-testnet.org");

// Адреса реєстру
const registryAddress = "0x300e7d225A141A20e00C1F375Dd99a32b0329758";
const phoneRegistry = new web3.eth.Contract(registryAbi, registryAddress);

// Номер телефону який перевіряємо
const phone = "+380989737510";

// Генеруємо хеш номеру з сілом "CELO"
const salt = "CELO";
const phoneHash = ethersUtils.keccak256(
  ethersUtils.defaultAbiCoder.encode(["string", "string"], [salt, phone])
);

// Отримуємо прив’язану адресу
phoneRegistry.methods.getMapping(phoneHash).call().then(addr => {
  console.log(`📞 ${phone} → ${addr}`);
}).catch(console.error);