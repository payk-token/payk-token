# PAYK Token
🪙 PAYK is a lightweight token for global crypto transfers by phone number, built on the CELO blockchain.

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

## Environment Setup
1. Install project dependencies:
```bash
npm install

2.	Create a .env file with the following variables:
PRIVATE_KEY=your_private_key
ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
PAYK_TOKEN_ADDRESS=your_contract_address_after_deployment
RECIPIENT_ADDRESS=recipient_wallet_address
MINT_AMOUNT=1000
BURN_AMOUNT=100

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
