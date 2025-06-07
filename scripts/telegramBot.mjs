import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import fs from "fs";
const keyEnvContent = fs.readFileSync(".env.keys", "utf-8");
const parsedKeys = Object.fromEntries(keyEnvContent.split("\n").filter(Boolean).map(line => line.split("=")));

const paykAbi = require("../artifacts/contracts/PAYKToken.sol/PAYKToken.json");
const registryAbi = require("../artifacts/contracts/PhoneMappingRegistry.sol/PhoneMappingRegistry.json");
import { utils as ethersUtils } from "ethers";
import { Bot, session } from "grammy";
import dotenv from "dotenv";

dotenv.config({ path: ".env.keys" });

const web3 = new Web3(process.env.ALFAJORES_RPC_URL);
const kit = newKitFromWeb3(web3);
kit.addAccount(parsedKeys.PRIVATE_KEY_380680082848);
kit.addAccount(parsedKeys.PRIVATE_KEY_380989737510);

const paykContract = new kit.web3.eth.Contract(paykAbi.abi, process.env.PAYK_TOKEN_ADDRESS);
const phoneRegistry = new kit.web3.eth.Contract(registryAbi.abi, process.env.PHONE_MAPPING_REGISTRY_ADDRESS);

function initialSession() {
  return { state: null, phone: null };
}
const phoneToChatMap = new Map();
const addressToPhoneMap = new Map();

const mainMenuKeyboard = {
  resize_keyboard: true,
  keyboard: [
    [{ text: "💸 Send transfer" }],
    [
      { text: "💼 My balance" },
      { text: "🔄 Exchange currency" }
    ],
    [
      { text: "🕗 Transfer history" },
      { text: "ℹ️ How it works?" }
    ],
  ],
};

const backButtonKeyboard = {
  keyboard: [[{ text: "⬅️ Back" }]],
  resize_keyboard: true,
  one_time_keyboard: true,
};


const bot = new Bot(process.env.BOT_TOKEN);
bot.use(session({ initial: initialSession }));

// ==== Transfer history helper ====
async function getTransferHistoryByPhone(phone, ctx, senderAddress) {
  const salt = "CELO";
  const phoneHash = ethersUtils.keccak256(
    ethersUtils.defaultAbiCoder.encode(["string", "string"], [salt, phone])
  );
  const userAddress = await phoneRegistry.methods.getMapping(phoneHash).call();
  if (!userAddress || userAddress === "0x0000000000000000000000000000000000000000") {
    return ["❌ No wallet is linked to this phone number."];
  }

  // Preload known phone-to-address mappings before fetching events
  for (const [phoneEntry, chatId] of phoneToChatMap.entries()) {
    const hash = ethersUtils.keccak256(
      ethersUtils.defaultAbiCoder.encode(["string", "string"], [salt, phoneEntry])
    );
    const resolved = await phoneRegistry.methods.getMapping(hash).call();
    if (resolved && resolved !== "0x0000000000000000000000000000000000000000") {
      addressToPhoneMap.set(resolved.toLowerCase(), phoneEntry);
    }
  }

  // Add stable tokens contracts
  const stableTokens = {
    PAYK: paykContract,
    cUSD: await kit.contracts.getStableToken(),
    cEUR: await kit.contracts.getStableToken("cEUR"),
  };

  const allEvents = [];

  for (const [symbol, contract] of Object.entries(stableTokens)) {
    const outgoing = await contract.getPastEvents("Transfer", {
      filter: { from: userAddress },
      fromBlock: 0,
      toBlock: "latest",
    });

    const incoming = await contract.getPastEvents("Transfer", {
      filter: { to: userAddress },
      fromBlock: 0,
      toBlock: "latest",
    });

    for (const e of [...outgoing, ...incoming]) {
      e.tokenSymbol = symbol;
      allEvents.push(e);
    }
  }

  const all = allEvents
    .sort((a, b) => b.blockNumber - a.blockNumber)
    .slice(0, 5);

  if (all.length === 0) {
    return ["📭 No recent transfers found."];
  }

  // Filter unique transactions by transactionHash
  const uniqueTxMap = new Map();
  for (const e of all) {
    uniqueTxMap.set(e.transactionHash, e);
  }

  return await Promise.all(
    Array.from(uniqueTxMap.values()).map(async (event) => {
      const { from, to, value } = event.returnValues;
      // Detect decimals based on token and subtract fee for cUSD/cEUR
      let amountRaw = kit.web3.utils.fromWei(value, "ether");
      let amount;
      if (event.tokenSymbol === "PAYK") {
        amount = amountRaw;
      } else {
        // відняти фіксовану комісію
        amount = (parseFloat(amountRaw) - 0.5).toFixed(2);
      }
      const block = await web3.eth.getBlock(event.blockNumber);
      const date = new Date(block.timestamp * 1000).toLocaleString();

      const isSender = senderAddress?.toLowerCase() === from.toLowerCase();
      const direction = isSender ? "⬆️ Sent to" : "⬇️ Received from";
      const counterpartyAddress = isSender ? to : from;

      // Always prioritize address-to-phone mapping, and cache after mapping
      let counterparty = addressToPhoneMap.get(counterpartyAddress.toLowerCase());
      if (!counterparty) {
        // Try resolving phone from registry if not already cached
        const salt = "CELO";
        const allPhoneCandidates = Array.from(phoneToChatMap.keys());
        for (const phoneCandidate of allPhoneCandidates) {
          const hash = ethersUtils.keccak256(
            ethersUtils.defaultAbiCoder.encode(["string", "string"], [salt, phoneCandidate])
          );
          const resolved = await phoneRegistry.methods.getMapping(hash).call();
          if (resolved && resolved.toLowerCase() === counterpartyAddress.toLowerCase()) {
            counterparty = phoneCandidate;
            addressToPhoneMap.set(counterpartyAddress.toLowerCase(), counterparty); // cache!
            break;
          }
        }
        // If still not found, fallback to counterpartyPhone or address
        if (!counterparty) {
          // fallback to any available phone or raw address
          let counterpartyPhone = undefined;
          for (const phoneCandidate of allPhoneCandidates) {
            const hash = ethersUtils.keccak256(
              ethersUtils.defaultAbiCoder.encode(["string", "string"], [salt, phoneCandidate])
            );
            const resolved = await phoneRegistry.methods.getMapping(hash).call();
            if (resolved && resolved.toLowerCase() === counterpartyAddress.toLowerCase()) {
              counterpartyPhone = phoneCandidate;
              addressToPhoneMap.set(counterpartyAddress.toLowerCase(), counterpartyPhone); // cache!
              break;
            }
          }
          counterparty = counterpartyPhone || counterpartyAddress;
        }
      }
      const directionLabel = isSender ? `⬆️ Sent to: ${counterparty}` : `⬇️ Received from: ${counterparty}`;
      const formattedAmount = parseFloat(amount).toFixed(2);
      const tokenSymbol = event.tokenSymbol;
      // For USDT equivalent, only for PAYK, others skip
      let usdtEquivalent = "";
      if (tokenSymbol === "PAYK") {
        usdtEquivalent = ` (${(parseFloat(amount) * 0.1).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT)`;
      }
      const transferLine = `🕗 Date & time: ${date}
${directionLabel}
💰 Transfer amount: ${formattedAmount} ${tokenSymbol}${usdtEquivalent}`;

      const feeLine = tokenSymbol === "PAYK"
        ? `🪙 Transfer fee — 5 PAYK (0.5 USDT)`
        : `🪙 Transfer fee — 0.5 ${tokenSymbol}`;

      return `${transferLine}\n${feeLine}\n\n🔗 Transaction hash: ${event.transactionHash}`;
    })
  );
}

bot.command("start", async (ctx) => {
  await ctx.reply(
    `📲 To sign up or log in, please share your phone number.\n🔐 We do not store any personal data — only your secure cryptographic ID.`,
    {
      reply_markup: {
        keyboard: [[{ text: "📲 Share phone number", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
        selective: true,
      },
    }
  );
});

bot.on("message:contact", async (ctx) => {
  let userPhone = ctx.message.contact.phone_number;

  const demoPrivateKeys = {
    "+380680082848": parsedKeys.PRIVATE_KEY_380680082848,
    "+380989737510": parsedKeys.PRIVATE_KEY_380989737510,
  };

  if (!userPhone.startsWith("+")) userPhone = "+" + userPhone;
  const salt = "CELO";
  const phoneHash = ethersUtils.keccak256(
    ethersUtils.defaultAbiCoder.encode(["string", "string"], [salt, userPhone])
  );

  await ctx.reply(`📞 Phone number received: ${userPhone}\n⏳ Checking wallet registry...`);

  const mappedAddress = await phoneRegistry.methods.getMapping(phoneHash).call();
  if (mappedAddress && mappedAddress !== "0x0000000000000000000000000000000000000000") {
    ctx.session.phone = userPhone;
    ctx.session.senderPhone = userPhone;
    ctx.session.senderAddress = mappedAddress;
    ctx.session.privateKey = demoPrivateKeys[userPhone] || undefined;
    addressToPhoneMap.set(mappedAddress.toLowerCase(), userPhone);
    phoneToChatMap.set(userPhone, ctx.chat.id);

    // Save senderAddress in session for dynamic sender
    ctx.session.senderAddress = mappedAddress;

    // Try to get private key from environment or keep undefined if not available
    // Since we do not have private key mapping for existing wallets, leave ctx.session.privateKey undefined

    await ctx.reply(`✅ Wallet already linked to this phone number.\n🔐 You are successfully logged in.`, {
      reply_markup: mainMenuKeyboard,
    });
    return;
  }

  try {
    await ctx.reply(`🆕 Creating a new wallet for your number...\n🔗 Linking address to registry...`);

    // Generate new wallet (for now, mock with env address)
    const newWallet = web3.eth.accounts.create();
    const newAddress = newWallet.address;

    // Set mapping
    await phoneRegistry.methods.setMapping(phoneHash, newAddress).send({
      from: newAddress,
    });

    ctx.session.phone = userPhone;
    ctx.session.senderPhone = userPhone;
    ctx.session.privateKey = newWallet.privateKey;
    ctx.session.senderAddress = newAddress;
    addressToPhoneMap.set(newAddress.toLowerCase(), userPhone);
    phoneToChatMap.set(userPhone, ctx.chat.id);

    await ctx.reply(`🎉 Wallet created and linked to your phone number.\nYou can now receive PAYK transfers instantly!`, {
      reply_markup: mainMenuKeyboard,
    });
  } catch (err) {
    console.error("Wallet creation/mapping failed:", err);
    await ctx.reply(`❌ Failed to create or link your wallet.\nPlease try again later or contact support.`);
  }
});

// ==== Command handlers ====

bot.hears("ℹ️ How it works?", async (ctx) => {
  await ctx.reply(
`🟢 PAYK — international money transfer service by phone number
📱 Your phone number is your crypto wallet
😊 No registrations. No names. Just your phone number

💠 Built on the latest CELO blockchain
🔐 Data protected by ODIS encryption protocol — never stored in plain text

💸 Instantly send or receive money by phone number
🕗 Average transfer time: 3 seconds
🪙 Fixed transfer fee: only 5 PAYK (0.5 USDT)
🔄 PAYK can be exchanged for USDT, USD, EUR or other currencies`
  );
});


bot.hears("💸 Send transfer", async (ctx) => {
  ctx.session.state = "awaiting_phone";
  await ctx.reply("📲 Enter the recipient's phone number in international format (e.g., +380951112233)", {
    reply_markup: {
      keyboard: [[{ text: "⬅️ Back" }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    }
  });
});


bot.callbackQuery("currency_cusd", async (ctx) => {
  ctx.session.transferCurrency = "cUSD";
  ctx.session.state = "awaiting_amount";
  await ctx.answerCallbackQuery();
  // Now prompt for amount (the phone should already be set in session)
  const salt = "CELO";
  const phoneHash = ethersUtils.keccak256(
    ethersUtils.defaultAbiCoder.encode(["string", "string"], [salt, ctx.session.senderPhone])
  );
  const senderAddressResolved = await phoneRegistry.methods.getMapping(phoneHash).call();
  const currency = ctx.session.transferCurrency || "cUSD";
  const stableToken = await kit.contracts.getStableToken(currency === "cUSD" ? undefined : "cEUR");
  const decimals = await stableToken.decimals();
  const stableBalanceRaw = await stableToken.balanceOf(senderAddressResolved);
  const stableBalance = stableBalanceRaw.dividedBy(10 ** decimals).toFixed(2);
  const balanceMessage = `💰 Enter the amount of ${currency}\n\n💼 Your balance: ${stableBalance} ${currency}`;
  await ctx.reply(
    balanceMessage,
    {
      reply_markup: backButtonKeyboard,
    }
  );
});

bot.callbackQuery("currency_ceur", async (ctx) => {
  ctx.session.transferCurrency = "cEUR";
  ctx.session.state = "awaiting_amount";
  await ctx.answerCallbackQuery();
  const salt = "CELO";
  const phoneHash = ethersUtils.keccak256(
    ethersUtils.defaultAbiCoder.encode(["string", "string"], [salt, ctx.session.senderPhone])
  );
  const senderAddressResolved = await phoneRegistry.methods.getMapping(phoneHash).call();
  const currency = ctx.session.transferCurrency || "cEUR";
  const stableToken = await kit.contracts.getStableToken(currency === "cUSD" ? undefined : "cEUR");
  const decimals = await stableToken.decimals();
  const stableBalanceRaw = await stableToken.balanceOf(senderAddressResolved);
  const stableBalance = stableBalanceRaw.dividedBy(10 ** decimals).toFixed(2);
  const balanceMessage = `💰 Enter the amount of ${currency}\n\n💼 Your balance: ${stableBalance} ${currency}`;
  await ctx.reply(
    balanceMessage,
    {
      reply_markup: backButtonKeyboard,
    }
  );
});

bot.callbackQuery("currency_payk", async (ctx) => {
  ctx.session.transferCurrency = "PAYK";
  ctx.session.state = "awaiting_amount";
  await ctx.answerCallbackQuery();
  const salt = "CELO";
  const phoneHash = ethersUtils.keccak256(
    ethersUtils.defaultAbiCoder.encode(["string", "string"], [salt, ctx.session.senderPhone])
  );
  const senderAddressResolved = await phoneRegistry.methods.getMapping(phoneHash).call();
  const paykBalanceWei = await paykContract.methods.balanceOf(senderAddressResolved).call();
  const paykBalance = parseFloat(kit.web3.utils.fromWei(paykBalanceWei, "ether"));
  const usdtEquivalent = (paykBalance * 0.1).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const balanceMessage = `💰 Enter the amount of PAYK\n\n💼 Your balance:\n🔹 ${paykBalance.toLocaleString("en-US")} PAYK (${usdtEquivalent} USDT)`;
  await ctx.reply(
    balanceMessage,
    {
      reply_markup: backButtonKeyboard,
    }
  );
});



bot.hears("🔄 Exchange currency", async (ctx) => {
  await ctx.reply(
    "🟠 This feature is currently not available."
  );
});

bot.hears("🔘 Top up balance", async (ctx) => {
  await ctx.reply("🟠 This feature is currently not available.");
});

bot.hears("💳 Withdraw funds", async (ctx) => {
  await ctx.reply("🟠 This feature is currently not available.");
});

bot.hears("💼 My balance", async (ctx) => {
  if (!ctx.session.senderPhone) {
    return ctx.reply("❌ Please log in first.");
  }

  try {
    const salt = "CELO";
    const phoneHash = ethersUtils.keccak256(
      ethersUtils.defaultAbiCoder.encode(["string", "string"], [salt, ctx.session.senderPhone])
    );
    const userAddress = await phoneRegistry.methods.getMapping(phoneHash).call();
    const paykBalanceWei = await paykContract.methods.balanceOf(userAddress).call();
    const paykBalance = parseFloat(kit.web3.utils.fromWei(paykBalanceWei, "ether"));
    const usdtEquivalent = (paykBalance * 0.1).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // --- Add cUSD/cEUR balances ---
    const cUSD = await kit.contracts.getStableToken();
    const cEUR = await kit.contracts.getStableToken("cEUR");
    const cUSDBalanceRaw = await cUSD.balanceOf(userAddress);
    const cEURBalanceRaw = await cEUR.balanceOf(userAddress);
    const decimals = await cUSD.decimals(); // Однакові для обох
    const cUSDBalance = cUSDBalanceRaw.dividedBy(10 ** decimals);
    const cEURBalance = cEURBalanceRaw.dividedBy(10 ** decimals);

    await ctx.reply(
      `💼 Your balance:

🇺🇸 ${cUSDBalance.toFixed(2)} cUSD
🇪🇺 ${cEURBalance.toFixed(2)} cEUR
❇️ ${paykBalance.toLocaleString("en-US")} PAYK (${usdtEquivalent} USDT)

🔄 Exchange rate: 1 PAYK = 0.10 USDT`,
      {
        reply_markup: {
          resize_keyboard: true,
          keyboard: [
            [{ text: "🔘 Top up balance" }],
            [
              { text: "💳 Withdraw funds" },
              { text: "🔄 Exchange currency" }
            ],
            [{ text: "⬅️ Back" }]
          ]
        }
      }
    );
  } catch (error) {
    console.error("Balance fetch error:", error);
    await ctx.reply("❌ Failed to fetch balance. Please try again later.");
  }
});

bot.hears("🕗 Transfer history", async (ctx) => {
  if (!ctx.session.phone) {
    return ctx.reply("❌ Please log in first.");
  }

  await ctx.reply("⏳ Loading your recent transfers…");
  const historyLines = await getTransferHistoryByPhone(ctx.session.phone, ctx, ctx.session.senderAddress);
  for (const line of historyLines) {
    await ctx.reply(line);
  }
});

bot.hears("✅ Continue", async (ctx) => {
  ctx.session.state = "awaiting_phone";
  await ctx.reply(
    "📲 Enter the recipient's phone number in international format (e.g., +380951112233)"
  );
});

bot.hears("⬅️ Back", async (ctx) => {
  ctx.session.state = null;
  await ctx.reply("⬅️ You have returned to the main menu", {
    reply_markup: mainMenuKeyboard,
  });
});

// ==== Text message handling ====

bot.on("message:text", async (ctx) => {
  const text = ctx.message.text.trim();

  if (!ctx.session.state && text.match(/^\+380\d{9}$/)) {
    ctx.reply(`Please confirm the recipient's number: ${text}`);
    return;
  }

  if (ctx.session.state === "awaiting_phone") {
    if (!text.match(/^\+380\d{9}$/)) {
      return ctx.reply(
        "📲 Enter the recipient's phone number in international format (e.g., +380951112233)",
        {
          reply_markup: backButtonKeyboard,
        }
      );
    }
    ctx.session.phone = text;
    if (!ctx.session.phone.startsWith("+")) ctx.session.phone = "+" + ctx.session.phone;
    ctx.session.state = "awaiting_currency_selection";
    await ctx.reply("💱 Select currency for transfer:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "cUSD", callback_data: "currency_cusd" },
            { text: "cEUR", callback_data: "currency_ceur" },
            { text: "PAYK", callback_data: "currency_payk" }
          ]
        ]
      }
    });
    return;
  }

  if (ctx.session.state === "awaiting_amount") {
    const amount = parseFloat(text);
    if (isNaN(amount) || amount <= 0) {
      return ctx.reply("❌ Please enter a number greater than 0.");
    }

    try {
      // --- Handle different transfer currencies ---
      const transferCurrency = ctx.session.transferCurrency || "PAYK";
      const salt = "CELO";
      const phoneHash = ethersUtils.keccak256(
        ethersUtils.defaultAbiCoder.encode(["string", "string"], [salt, ctx.session.phone])
      );

      if (transferCurrency !== "PAYK") {
        const stableToken = await kit.contracts.getStableToken(transferCurrency === "cUSD" ? undefined : "cEUR");
        const decimals = await stableToken.decimals();
        const recipientAddress = await phoneRegistry.methods.getMapping(phoneHash).call();

        if (recipientAddress === "0x0000000000000000000000000000000000000000") {
          return ctx.reply("❌ This phone number is not linked to any wallet address.");
        }

        const totalAmount = amount + 0.5; // додаємо комісію в цій же валюті
        const amountInUnits = (totalAmount * 10 ** decimals).toString();

        const tx = await stableToken.transfer(recipientAddress, amountInUnits).send({ from: ctx.session.senderAddress });

        await ctx.reply(
          `✅ Sent ${amount.toFixed(2)} ${transferCurrency} to ${ctx.session.phone}\n🪙 Transfer fee — ${0.5.toFixed(2)} ${transferCurrency}`,
          {
            reply_markup: mainMenuKeyboard,
          }
        );
        await ctx.reply("💸");

        const recipientChatId = phoneToChatMap.get(ctx.session.phone);
        if (recipientChatId) {
          await bot.api.sendMessage(
            recipientChatId,
            `⬇️ You received ${amount.toFixed(2)} ${transferCurrency}\n📱 From ${ctx.session.phone}\n💰 It’s already in your wallet!`
          );
          await bot.api.sendMessage(recipientChatId, "💸");
        }

        ctx.session.state = null;
        return;
      }

      await ctx.reply("⏳ Sending transfer…");
      const recipientAddress = await phoneRegistry.methods.getMapping(phoneHash).call();
      if (recipientAddress === "0x0000000000000000000000000000000000000000") {
        return ctx.reply("❌ This phone number is not linked to any wallet address.");
      }

      const amountInWei = kit.web3.utils.toWei(amount.toString(), "ether");
      const txData = paykContract.methods.transfer(recipientAddress, amountInWei).encodeABI();

      const senderPrivateKey = ctx.session.privateKey || process.env.PRIVATE_KEY;
      const senderAccount = web3.eth.accounts.privateKeyToAccount(senderPrivateKey);

      const signedTx = await web3.eth.accounts.signTransaction({
        from: ctx.session.senderAddress,
        to: paykContract.options.address,
        data: txData,
        gas: 200000,
      }, senderPrivateKey);

      const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      const formattedAmount = amount.toLocaleString("en-US");
      await ctx.reply(
        `✅ Sent ${formattedAmount} PAYK (${(amount * 0.1).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT) to number ${ctx.session.phone}\n🪙 Transfer fee — 5 PAYK (0.5 USDT)`,
        {
          reply_markup: mainMenuKeyboard,
        }
      );
      await ctx.reply("💸");
      const recipientChatId = phoneToChatMap.get(ctx.session.phone);
      if (recipientChatId) {
        const formattedAmount = amount.toLocaleString("en-US");
        const usdtEquivalent = (amount * 0.1).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        await bot.api.sendMessage(
          recipientChatId,
          `⬇️ You received ${formattedAmount} PAYK (${usdtEquivalent} USDT)\n📱 From ${ctx.session.phone}\n💰 It’s already in your wallet!`
        );
        await bot.api.sendMessage(recipientChatId, "💸");
      }
      ctx.session.state = null;
    } catch (err) {
      console.error("Transfer failed:", err);
      await ctx.reply(`❌ Transfer failed: ${err.message}`, {
        reply_markup: mainMenuKeyboard,
      });
      ctx.session.state = null;
    }
  }
});

bot.start();
console.log("🤖 PAYK Telegram Bot is running...");