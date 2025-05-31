import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const paykAbi = require("../artifacts/contracts/PAYKToken.sol/PAYKToken.json");
const registryAbi = require("../artifacts/contracts/PhoneMappingRegistry.sol/PhoneMappingRegistry.json");
import { utils as ethersUtils } from "ethers";
import { Bot, session } from "grammy";
import dotenv from "dotenv";

dotenv.config();

const web3 = new Web3(process.env.ALFAJORES_RPC_URL);
const kit = newKitFromWeb3(web3);
kit.addAccount(process.env.PRIVATE_KEY);

const senderAddress = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY).address;
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

  const events = await paykContract.getPastEvents("Transfer", {
    filter: { from: userAddress },
    fromBlock: 0,
    toBlock: "latest",
  });

  const incoming = await paykContract.getPastEvents("Transfer", {
    filter: { to: userAddress },
    fromBlock: 0,
    toBlock: "latest",
  });

  const all = [...events, ...incoming]
    .sort((a, b) => b.blockNumber - a.blockNumber)
    .slice(0, 3);

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
      const amount = kit.web3.utils.fromWei(value, "ether");
      const block = await web3.eth.getBlock(event.blockNumber);
      const date = new Date(block.timestamp * 1000).toLocaleString();

      const isSender = senderAddress?.toLowerCase() === from.toLowerCase();
      const direction = isSender ? "⬆️ Sent to" : "⬇️ Received from";
      const counterpartyAddress = isSender ? to : from;

      let counterpartyPhone = addressToPhoneMap.get(counterpartyAddress.toLowerCase());
      if (!counterpartyPhone) {
        // Try resolving phone from registry
        const salt = "CELO";
        const allPhoneCandidates = Array.from(phoneToChatMap.keys());
        for (const phoneCandidate of allPhoneCandidates) {
          const hash = ethersUtils.keccak256(
            ethersUtils.defaultAbiCoder.encode(["string", "string"], [salt, phoneCandidate])
          );
          const resolved = await phoneRegistry.methods.getMapping(hash).call();
          if (resolved.toLowerCase() === counterpartyAddress.toLowerCase()) {
            counterpartyPhone = phoneCandidate;
            addressToPhoneMap.set(counterpartyAddress.toLowerCase(), phoneCandidate);
            break;
          }
        }
      }

      const counterparty = counterpartyPhone || addressToPhoneMap.get(counterpartyAddress.toLowerCase()) || counterpartyAddress;
      const directionLabel = isSender ? `⬆️ Sent to: ${counterparty}` : `⬇️ Received from: ${counterparty}`;
      const usdtEquivalent = (parseFloat(amount) * 0.1).toFixed(2);
      const formattedAmount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

      return `🕗 Date & time: ${date}\n${directionLabel}\n💰 Transfer amount: ${formattedAmount} PAYK (${usdtEquivalent} USDT)\n🪙 Transfer fee — 5 PAYK (0.5 USDT)\n\n🔗 Transaction hash: ${event.transactionHash}`;
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
    addressToPhoneMap.set(mappedAddress.toLowerCase(), userPhone);
    phoneToChatMap.set(userPhone, ctx.chat.id);
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
      from: senderAddress,
    });

    ctx.session.phone = userPhone;
    ctx.session.senderPhone = userPhone;
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
  await ctx.reply(
    "📲 Enter the recipient's phone number in international format (e.g., +380951112233)",
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
    const usdtEquivalent = (paykBalance * 0.1).toFixed(2);

    await ctx.reply(
      `💼 Your balance:\n🔹 ${paykBalance.toLocaleString("en-US")} PAYK (${usdtEquivalent} USDT)\n\n🔄 Exchange rate: 1 PAYK = 0.10 USDT`,
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
    ctx.session.state = "awaiting_amount";

    const salt = "CELO";
    const phoneHash = ethersUtils.keccak256(
      ethersUtils.defaultAbiCoder.encode(["string", "string"], [salt, ctx.session.senderPhone])
    );
    const senderAddressResolved = await phoneRegistry.methods.getMapping(phoneHash).call();
    const paykBalanceWei = await paykContract.methods.balanceOf(senderAddressResolved).call();
    const paykBalance = parseFloat(kit.web3.utils.fromWei(paykBalanceWei, "ether"));
    const usdtEquivalent = (paykBalance * 0.1).toFixed(2);

    return ctx.reply(
      `💰 Enter the amount of PAYK you want to send\n\n💼 Your balance:\n🔹 ${paykBalance.toLocaleString("en-US")} PAYK (${usdtEquivalent} USDT)`,
      {
        reply_markup: backButtonKeyboard,
      }
    );
  }

  if (ctx.session.state === "awaiting_amount") {
    const amount = parseFloat(text);
    if (isNaN(amount) || amount <= 0) {
      return ctx.reply("❌ Please enter a number greater than 0.");
    }

    try {
      const salt = "CELO";
      const phoneHash = ethersUtils.keccak256(
        ethersUtils.defaultAbiCoder.encode(["string", "string"], [salt, ctx.session.phone])
      );

      const recipientAddress = await phoneRegistry.methods.getMapping(phoneHash).call();
      if (recipientAddress === "0x0000000000000000000000000000000000000000") {
        return ctx.reply("❌ This phone number is not linked to any wallet address.");
      }

      const amountInWei = kit.web3.utils.toWei(amount.toString(), "ether");
      const tx = await paykContract.methods.transfer(recipientAddress, amountInWei).send({ from: ctx.session.senderAddress });

      const formattedAmount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      await ctx.reply(
        `✅ Sent ${formattedAmount} PAYK (${(amount * 0.1).toFixed(2)} USDT) to number ${ctx.session.phone}\n🪙 Transfer fee — 5 PAYK (0.5 USDT)`,
        {
          reply_markup: mainMenuKeyboard,
        }
      );
      await ctx.reply("💸");
      const recipientChatId = phoneToChatMap.get(ctx.session.phone);
      if (recipientChatId) {
        const formattedAmount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        const usdtEquivalent = (amount * 0.1).toFixed(2);
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