require('dotenv').config();
const { newKitFromWeb3 } = require('@celo/contractkit');
const Web3 = require('web3');

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ACCOUNT_ADDRESS = process.env.RECIPIENT_ADDRESS;
const DEK_PUBLIC_KEY = process.env.DEK_PUBLIC_KEY_COMPRESSED; // compressed 0x...

async function registerDEK() {
    const web3 = new Web3(process.env.ALFAJORES_RPC_URL);
    const kit = newKitFromWeb3(web3);

    kit.connection.addAccount(PRIVATE_KEY);
    const sender = (await kit.web3.eth.getAccounts())[0];
    kit.defaultAccount = sender;

    const accountsContract = await kit.contracts.getAccounts();

    console.log(`📢 Registering DEK for account: ${sender}`);
    const tx = await accountsContract.setAccountDataEncryptionKey(DEK_PUBLIC_KEY).send({ from: sender });

    const receipt = await tx.waitReceipt();
    console.log(`✅ DEK registered. TxHash: ${receipt.transactionHash}`);
}

registerDEK();