# PAYK Token

🪙 PAYK — Global Mobile Crypto Transfers

💸 Send and receive money instantly via the PAYK chatbot in your favorite messenger. No apps, no registration — just your phone number. Exchange PAYK to stablecoins (cUSD, cEUR) or withdraw to fiat money.


![PAYK  Home](https://github.com/user-attachments/assets/513c6250-58ff-41b6-8daf-754fd14aa1c0)

![PAYK  Technology](https://github.com/user-attachments/assets/4005d7c3-771e-4894-9c9b-f4557bb13eb8)

## Project Description
PAYK is a mobile-first crypto solution that enables instant and low-cost international money transfers using just a phone number. Built on the Celo blockchain, PAYK combines a non-custodial wallet, ultralight mobile client, and native support for stablecoins (cUSD, cEUR).

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
│    └── balance.js     # Checks PAYK token balance
├── .env                # Environment variables
├── hardhat.config.js   # Hardhat network configuration
├── package.json        # NPM configuration and scripts
└── README.md

## Available Scripts
- Deploy the contract: npm run deploy
- Mint PAYK tokens: npm run mint
- Burn PAYK tokens: npm run burn
- Check PAYK token balance: npm run balance

## Upcoming Features
- 📲 Mapping phone numbers to wallet addresses via CELO ODIS.
- 💸 Sending tokens by phone number.
- 🪙 Stablecoin support: CELO cUSD / cEUR integration.
- ❇️ Mobile app integration for seamless UX.

## License

MIT License. © 2025 PAYK Team
