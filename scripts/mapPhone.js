require('dotenv').config();

const { newKit } = require('@celo/contractkit');
const { OdisUtils } = require('@celo/identity');

async function main() {
    const kit = newKit(process.env.ALFAJORES_RPC_URL);
    const account = kit.web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
    kit.connection.addAccount(account.privateKey);
    kit.defaultAccount = account.address;

    const phoneNumber = process.env.TEST_PHONE_NUMBER;
    if (!phoneNumber.startsWith('+')) {
        throw new Error('Phone number must be in E.164 format (e.g. +1234567890)');
    }

    const authSigner = {
        authenticationMethod: OdisUtils.Query.AuthenticationMethod.WALLET_KEY,
        contractKit: kit,
    };

    const serviceContext = OdisUtils.Query.getServiceContext(OdisUtils.Query.OdisContextName.ALFAJORES);

    console.log('🔧 Service Context:', serviceContext);

    try {
        console.log(`🔍 Checking quota for address: ${account.address}`);

        const quotaStatus = await OdisUtils.Quota.getPnpQuotaStatus(
            account.address,
            authSigner,
            serviceContext
        );
        console.log('📊 Remaining quota:', quotaStatus.remainingQuota);

        if (quotaStatus.remainingQuota < 1) {
            console.log('💸 Purchasing quota...');
            const stableToken = await kit.contracts.getStableToken();
            const odisPayments = await kit.contracts.getOdisPayments();
            const ONE_CENT_CUSD_WEI = '10000000000000000';

            console.log('✅ Approving cUSD spend...');
            await stableToken.increaseAllowance(odisPayments.address, ONE_CENT_CUSD_WEI)
                .sendAndWaitForReceipt();

            console.log('✅ Paying for quota...');
            await odisPayments.payInCUSD(account.address, ONE_CENT_CUSD_WEI)
                .sendAndWaitForReceipt();

            console.log('✅ Quota purchased successfully!');
        }

        const { phoneHash, pepper } = await OdisUtils.PhoneNumberIdentifier.getPhoneNumberIdentifier(
            phoneNumber,
            account.address,
            authSigner,
            serviceContext
        );

        console.log(`📱 Phone identifier (hash) for ${phoneNumber}: ${phoneHash}`);
        console.log(`🧂 Pepper: ${pepper}`);
    } catch (error) {
        console.error('❌ Error during phone mapping:', error);
    }
}

main();