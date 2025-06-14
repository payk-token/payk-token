# PAYK — Global Mobile Transfers

💸 Instantly send and receive money through the PAYK chatbot on WhatsApp, Telegram, or Facebook Messenger — or use our lightweight mobile web app.
No downloads. No sign-ups. Just your phone number.

🌍 Send and receive USD or EUR in stablecoins like cUSD and cEUR — native stablecoins of the Celo blockchain — as well as USDC (by Circle) and USDT (by Tether).
Easily exchange them into local currency whenever you need.

🔗 Powered by Celo, a mobile-first Ethereum Layer 2 blockchain designed for fast, affordable, and borderless payments.


![PAYK Home](PAYK. Home.jpeg)

![PAYK Technology](PAYK. Technology.jpeg)

# Project Description

PAYK is a lightweight, mobile-first crypto transfer service built on **Celo**, an Ethereum Layer 2 blockchain optimized for fast, low-cost, and mobile-native payments.

PAYK enables instant and affordable international money transfers using just a phone number. It combines a non-custodial wallet, ultralight mobile client, and native support for stablecoins — all without requiring app installation or user registration.

🔹 **How it works**

Send and receive money instantly via the PAYK chatbot on:
- WhatsApp
- Telegram
- Facebook Messenger

Or use our mobile web app — no app downloads or sign-ups required. Just your phone number.

🔹 **Supported stablecoins**

PAYK supports fast and secure transfers in:
- **cUSD** and **cEUR** – native stablecoins on the Celo blockchain  
- **USDC** – by Circle  
- **USDT** – by Tether

All of them are easily exchangeable into local currencies.

🔹 **Security & Privacy**

Behind the scenes, PAYK performs dynamic mapping of phone numbers to wallet addresses using a secure hashing process. This ensures that each phone number is linked to a wallet via an on-chain registry. To protect user privacy and enhance security, all phone identifiers are encrypted using Celo’s **ODIS** (Oblivious Decentralized Identifier Service), making the mapping process tamper-resistant and censorship-proof.

With average transaction costs under $0.50 / €0.50 and near-instant finality, PAYK offers a seamless and intuitive user experience.

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
│   ├── telegramBot.mjs              # Telegram bot implementation
│   ├── testPhoneMappingFlow.js       # E2E test for phone mapping
│   ├── testTransferByIdentifier.js   # Test transfer by identifier
│   └── transferByPhoneIdentifier.js  # Real transfer logic via mapping
├── .env
├── .env.example
├── .env.keys
├── hardhat.config.js

## Available Scripts
- Deploy PAYK token: npx hardhat run scripts/deployPAYK.js --network alfajores
- Deploy PAYK token: npx hardhat run scripts/deployPAYK.js --network alfajores
- Deploy PhoneMappingRegistry: npx hardhat run scripts/deployPhoneMappingRegistry.js --network alfajores
- Mint PAYK tokens: npx hardhat run scripts/mint.js --network alfajores
- Burn PAYK tokens: npx hardhat run scripts/burn.js --network alfajores
- Check PAYK balance: node scripts/balance.js
- Check mapping: node scripts/checkMapping.js
- Transfer via phone number: node scripts/transferByPhoneIdentifier.js
- Start Telegram bot: node scripts/telegramBot.mjs
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
