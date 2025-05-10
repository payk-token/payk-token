require('dotenv').config();
const { newKit } = require('@celo/contractkit');

async function main() {
    const kit = newKit(process.env.ALFAJORES_RPC_URL);
    const account = kit.web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
    kit.connection.addAccount(account.privateKey);
    kit.defaultAccount = account.address;

    console.log('✅ Loaded account:', account.address);

    try {
        // Check CELO balance
        const celoBalanceWei = await kit.web3.eth.getBalance(account.address);
        const celoBalance = kit.web3.utils.fromWei(celoBalanceWei, 'ether');
        console.log('💰 CELO balance:', celoBalance, 'CELO');

        // Check cUSD balance
        const stableToken = await kit.contracts.getStableToken();
        const cusdBalanceWei = await stableToken.balanceOf(account.address);
        const cusdBalance = kit.web3.utils.fromWei(cusdBalanceWei.toString(), 'ether');
        console.log('💰 cUSD balance:', cusdBalance, 'cUSD');

        // Check PAYK token balance
        const paykTokenAddress = process.env.PAYK_TOKEN_ADDRESS;
        const paykToken = new kit.web3.eth.Contract([
            {
                constant: true,
                inputs: [{ name: 'account', type: 'address' }],
                name: 'balanceOf',
                outputs: [{ name: '', type: 'uint256' }],
                type: 'function',
            },
            {
                constant: true,
                inputs: [],
                name: 'symbol',
                outputs: [{ name: '', type: 'string' }],
                type: 'function',
            },
        ], paykTokenAddress);

        const paykSymbol = await paykToken.methods.symbol().call();
        const paykBalanceWei = await paykToken.methods.balanceOf(account.address).call();
        const paykBalance = kit.web3.utils.fromWei(paykBalanceWei.toString(), 'ether');
        console.log(`💰 ${paykSymbol} balance:`, paykBalance, paykSymbol);
    } catch (error) {
        console.error('❌ Error checking balances:', error);
    }
}

main();