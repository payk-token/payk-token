# PAYK — Global Mobile Crypto Transfers

💸 Send and receive crypto instantly via the PAYK chatbot in your favorite messenger (WhatsApp, Telegram, or Facebook Messenger).
No apps, no registration — just your phone number.
Exchange PAYK for stablecoins and withdraw to fiat money.


![PAYK  Home](https://github.com/user-attachments/assets/513c6250-58ff-41b6-8daf-754fd14aa1c0)

![PAYK  Technology](https://github.com/user-attachments/assets/63c6824f-bade-4883-ba4a-113c090c34fb)

## Project Description
PAYK is a mobile-first crypto solution that enables instant and low-cost international money transfers using just a phone number. Built on the CELO blockchain, PAYK combines a non-custodial wallet, ultralight mobile client, and native support for stablecoins (cUSD, cEUR).

No app installation or registration is needed — just open our chatbot PAYK in your preferred messenger (WhatsApp, Telegram, or Facebook Messenger) and send funds instantly. With average transaction costs under $0.50 and near-instant finality, PAYK offers a seamless and intuitive user experience.

Behind the scenes, PAYK performs dynamic mapping of phone numbers to wallet addresses using a secure hashing process. This ensures that each phone number is linked to a wallet via an on-chain registry. To protect user privacy and enhance security, all phone identifiers are encrypted using CELO's ODIS (Oblivious Decentralized Identifier Service), making the mapping process both tamper-resistant and censorship-proof.

## Technologies Used
- Blockchain: CELO Alfajores Testnet
- Solidity v0.8.20 (Upgradeable Smart Contracts)
- Hardhat for local development
- OpenZeppelin Upgradeable Contracts

## Project Structure

```
payk-token/
├── contracts/
│   ├── PAYKToken.sol
│   ├── PhoneMapping.sol
│   └── PhoneMappingRegistry.sol
├── scripts/
│   ├── balance.js                     # Check PAYK balance
│   ├── burn.js                        # Burn PAYK tokens
│   ├── checkCusdBalance.js           # Check cUSD balance
│   ├── checkEnvAndBalances.js        # Check all relevant balances
│   ├── checkKeyMappingMatch.js       # Compare address from key and mapping
│   ├── checkMapping.js               # Read mapping from registry
│   ├── deployPAYK.js                 # Deploy PAYKToken contract
│   ├── deployPhoneMapping.js         # Deploy PhoneMapping
│   ├── deployPhoneMappingRegistry.js # Deploy PhoneMappingRegistry
│   ├── fundQuotaViaOdisPayments.js   # Fund ODIS quota
│   ├── generateDEK.js                # Generate DEK key pair
│   ├── manualMapPhone.js             # Map phone manually to address
│   ├── mapPhone.js                   # Map phone hash
│   ├── mapPhoneDEK-mock.js           # Map phone with mock ODIS/DEK
│   ├── mapPhoneDEK.js                # Map phone via ODIS
│   ├── mint.js                       # Mint PAYK tokens
│   ├── registerDEK.js                # Register DEK
│   ├── telegramBot.mjs               # Telegram bot implementation
│   ├── testPhoneMappingFlow.js       # E2E test for phone mapping
│   ├── testTransferByIdentifier.js   # Test transfer by identifier
│   └── transferByPhoneIdentifier.js  # Real transfer logic via mapping
├── .env
├── .env.example
├── .env.keys
└── hardhat.config.js
```

## Available Scripts
- Deploy PAYK token: npx hardhat run scripts/deployPAYK.js --network alfajores
- Deploy PhoneMappingRegistry: npx hardhat run scripts/deployPhoneMappingRegistry.js --network alfajores
- Mint PAYK tokens: npx hardhat run scripts/mint.js --network alfajores
- Burn PAYK tokens: npx hardhat run scripts/burn.js --network alfajores
- Check PAYK balance: node scripts/balance.js
- Check mapping: node scripts/checkMapping.js
- Transfer via phone number: node scripts/transferByPhoneIdentifier.js
- Start Telegram bot: node scripts/telegramBot.mjs

## Upcoming Features
- 📲 Phone number mapping via CELO ODIS (prototype implemented with on-chain registry)
- 💸 Token transfers by phone identifier (mock ODIS flow integrated)
- 🪙 Stablecoin support: cUSD / cEUR  
- ❇️ Mobile app & chatbot integration

## License

MIT License. © 2025 PAYK Team
