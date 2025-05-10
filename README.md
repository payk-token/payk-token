# PAYK Token

🪙 PAYK is a lightweight token designed for seamless global crypto transfers using just a phone number, built on the CELO blockchain.

💸 With PAYK, users can send and receive instant international transfers at minimal cost — fast, simple, and user-friendly.


![PAYK  Home](https://github.com/user-attachments/assets/513c6250-58ff-41b6-8daf-754fd14aa1c0)

![PAYK  Technology](https://github.com/user-attachments/assets/4005d7c3-771e-4894-9c9b-f4557bb13eb8)

## Project Description
PAYK enables instant international transfers between users with minimal fees and a user-friendly experience — requiring only a phone number.

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

Available Scripts
•	Deploy the contract: npm run deploy
•	Mint PAYK tokens: npm run mint
•	Burn PAYK tokens: npm run burn
•	Check PAYK token balance: npm run balance

Upcoming Features
	•	📱 Mapping phone numbers to wallet addresses via CELO ODIS.
	•	📲 Sending tokens by phone number.
	•	💵 Stablecoin support: CELO cUSD / cEUR integration.
	•	📈 Mobile app integration for seamless UX.

License

MIT License. © 2025 PAYK Team
