require('dotenv').config();
const { newKit } = require('@celo/contractkit');

async function main() {
    if (!process.env.PRIVATE_KEY || !process.env.ALFAJORES_RPC_URL) {
        throw new Error('Please set PRIVATE_KEY and ALFAJORES_RPC_URL in your .env file');
    }

    const kit = newKit(process.env.ALFAJORES_RPC_URL);
    const account = kit.web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
    kit.connection.addAccount(account.privateKey);
    kit.defaultAccount = account.address;

    try {
        console.log('🔍 Checking cUSD balance for address:', account.address);

        // Get cUSD stable token contract
        const stableToken = await kit.contracts.getStableToken();

        // Get balance
        const balance = await stableToken.balanceOf(account.address);
        const formattedBalance = kit.web3.utils.fromWei(balance.toString(), 'ether');

        console.log('💰 Current cUSD balance:', formattedBalance, 'cUSD');
    } catch (error) {
        console.error('❌ Error checking cUSD balance:', error);
    }
}

main();