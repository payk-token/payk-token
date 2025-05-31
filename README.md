# PAYK — Global Mobile Crypto Transfers

💸 Send and receive crypto instantly via the PAYK chatbot in your favorite messenger (WhatsApp, Telegram, or Facebook Messenger).  
No apps, no registration — just your phone number.  
Exchange PAYK for CELO stablecoins (cUSD, cEUR) and withdraw to fiat money.


![PAYK  Home](https://github.com/user-attachments/assets/513c6250-58ff-41b6-8daf-754fd14aa1c0)

![PAYK  Technology](https://github.com/user-attachments/assets/4005d7c3-771e-4894-9c9b-f4557bb13eb8)

## Project Description
PAYK is a mobile-first crypto solution that enables instant and low-cost international money transfers using just a phone number. Built on the CELO blockchain, PAYK combines a non-custodial wallet, ultralight mobile client, and native support for stablecoins (cUSD, cEUR).

No app installation or registration is needed — just open our chatbot PAYK in your preferred messenger (WhatsApp, Telegram, or Facebook Messenger) and send funds instantly. With average transaction costs under $0.50 and near-instant finality, PAYK offers a seamless and intuitive user experience.

## Technologies Used
- Blockchain: CELO Alfajores Testnet
- Solidity v0.8.20 (Upgradeable Smart Contracts)
- Hardhat for local development
- OpenZeppelin Upgradeable Contracts

## Project Structure
payk-token/
├── contracts/
│    └── PAYKToken.sol
├── scripts/
│    ├── deploy.js      # Deploys the PAYKToken contract
│    ├── mint.js        # Mints PAYK tokens
│    ├── burn.js        # Burns PAYK tokens
│    ├── balance.js     # Checks PAYK token balance
├── .env                # Environment variables
├── hardhat.config.js   # Hardhat network configuration
├── PhoneMappingRegistry.sol  # On-chain phone hash to wallet mapping contract
├── transferByPhoneIdentifier.js  # Script for transferring tokens via phone number identifier
├── testPhoneMappingFlow.js  # End-to-end test for phone number based transfers
└── deployPhoneMappingRegistry.js  # Deploys the PhoneMappingRegistry contract

## Available Scripts
- Deploy the contract: npm run deploy
- Mint PAYK tokens: npm run mint
- Burn PAYK tokens: npm run burn
- Check PAYK token balance: npm run balance
- Deploy PhoneMappingRegistry: npx hardhat run scripts/deployPhoneMappingRegistry.js --network alfajores
- Test transfer by phone number identifier: npx hardhat run scripts/testPhoneMappingFlow.js --network alfajores

## Upcoming Features
- 📲 Phone number mapping via CELO ODIS (prototype implemented with on-chain registry)
- 💸 Token transfers by phone identifier (mock ODIS flow integrated)
- 🪙 Stablecoin support: cUSD / cEUR  
- ❇️ Mobile app & chatbot integration

## License

MIT License. © 2025 PAYK Team