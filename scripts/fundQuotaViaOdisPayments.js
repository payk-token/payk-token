require('dotenv').config();
const Web3 = require('web3');
const { newKitFromWeb3, StableToken } = require('@celo/contractkit');

const PRIVATE_KEY = process.env.PRIVATE_KEY;  // твій основний гаманець
const ODIS_QUOTA_AMOUNT = '0.01'; // cUSD amount for quota payment

async function fundQuota() {
    const web3 = new Web3(process.env.ALFAJORES_RPC_URL);
    const kit = newKitFromWeb3(web3);

    kit.connection.addAccount(PRIVATE_KEY);
    const sender = (await kit.web3.eth.getAccounts())[0];
    kit.defaultAccount = sender;

    console.log(`✅ Funding quota from account: ${sender}`);

    const odisPayments = await kit.contracts.getOdisPayments();
    const stableToken = await kit.contracts.getStableToken(StableToken.cUSD);

    const value = kit.web3.utils.toWei(ODIS_QUOTA_AMOUNT, 'ether');

    console.log(`📢 Approving ODIS Payments contract to spend ${ODIS_QUOTA_AMOUNT} cUSD...`);
    await stableToken
        .approve(odisPayments.address, value)
        .sendAndWaitForReceipt({ from: sender });

    console.log('📢 Sending payInCUSD transaction to ODIS...');
    const tx = await odisPayments
        .payInCUSD(sender, value)
        .sendAndWaitForReceipt({ from: sender });

    console.log(`✅ Quota payment successful. TxHash: ${tx.transactionHash}`);

    const quota = await odisPayments.totalPaidCUSD(sender);
    console.log(`✅ Total Quota Paid (cUSD): ${kit.web3.utils.fromWei(quota.toString(), 'ether')}`);
}

fundQuota();