# PAYK — Global Mobile Transfers

🌍 PAYK is a Web3 fintech service for instant, low-cost international money transfers, using just a phone number to send and receive funds.

🔗 Built on Celo, a mobile-first Ethereum Layer 2 blockchain, PAYK offers a non-custodial wallet, ultra-light mobile client, and native stablecoin support, all without app installations or user sign-ups.

💸 PAYK lets people send and receive US dollars and euros using stablecoins — cUSD, cEUR, USDC, or USDT, and easily exchange them into local currency.


![PAYK  Home](https://github.com/user-attachments/assets/c89c5be5-f336-4117-a517-149262808a4a)

![PAYK  Technology](https://github.com/user-attachments/assets/f56a0413-8abf-4b46-8435-6f86ed699a80)


# Project Description

PAYK is a lightweight, mobile-first crypto transfer service built on Celo, an Ethereum Layer 2 blockchain optimized for fast, low-cost, and mobile-native payments.


## ⚙️ How it works (technical overview)

### ✅ User authentication via phone number  
When a user opens the PAYK chatbot (Telegram, WhatsApp, or Facebook Messenger) or the web app, they enter their phone number. No password or KYC is required for basic use.

---

### 🔐 Phone number to wallet address mapping  
PAYK uses **ODIS** (Oblivious Decentralized Identifier Service), a privacy-preserving service on the Celo blockchain, to hash the phone number and resolve it to a wallet address. This process ensures:
- **User privacy** (the phone number itself is never stored on-chain)  
- **A unique and consistent mapping** per network  
  _e.g., `hash("CELO", phoneNumber) → wallet address`_

---

### 🔓 Non-custodial, smart contract-based wallet  
Each phone number maps to a **non-custodial wallet**. The user holds or indirectly controls the associated private key (or via managed key infrastructure in future versions). PAYK does not custody funds.

---

### 💸 Send and receive funds using phone numbers  
Once the phone number is mapped:
- Users can send **stablecoins (cUSD, cEUR, USDC, USDT)** to any other phone number  
- If the recipient has never used PAYK, the funds are **locked in a smart contract** until the recipient verifies their number (on-chain claim)

---

### 🔁 Transaction flow
1. Sender inputs recipient’s phone number and amount  
2. PAYK maps recipient’s number → address (via ODIS)  
3. Transaction is signed and broadcast via the Celo blockchain  
4. Funds arrive instantly to the recipient’s mapped wallet address

---

### ⚡ Fees and speed  
- **Typical transaction cost:** under **$0.50 / €0.50**  
- **Finality:** ~5 seconds on **Celo L2**  
- **Fully transparent and traceable** on-chain

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
- 🪙 Stablecoin support: USDC / USDT  
- ❇️ Mobile app & chatbot integration

## License

MIT License. © 2025 PAYK Team
