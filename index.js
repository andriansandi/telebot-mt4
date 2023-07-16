const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Define the configurable parameters
const config = {
  channelUsername: process.env.CHANNEL_USERNAME,
  lotSize: parseFloat(process.env.LOT_SIZE),
  entryCount: parseInt(process.env.ENTRY_COUNT),
  profitPips: parseFloat(process.env.PROFIT_PIPS),
  broadcast: process.env.BROADCAST,
};

// Set default TP values
const defaultTP1Pips = 20;
const defaultTP2Pips = 40;

// Start command handler
bot.command('start', ctx => {
  console.log(ctx.from);
  bot.telegram.sendMessage(ctx.chat.id, 'Hello!, I am TBXMINER BOT that will forwarded your signal', {});
});

// Text message handler
bot.on('text', async (ctx) => {
  const chatText = ctx.message.text;

  console.log("==============");
  // Extract symbol, action, entryLow, and entryHigh
  const { symbol, action, entryLow, entryHigh, entryPrice } = extractSymbolActionEntry(chatText);

  // Extract TP levels
  const { tp1, tp2, sl } = extractTPLevels(chatText);

  // Calculate lot size per entry
  const entryLotSize = calculateEntryLotSize(config.lotSize, config.entryCount);

  // Calculate individual entry step
  const entryStep = calculateEntryStep(entryLow, entryHigh, config.entryCount);

  // Calculate entryTP values
  const entryTPs = calculateEntryTPs(action, entryLow, entryPrice, tp1, tp2, config.profitPips);

  // Reverse the entry array when the action is "SELL"
  const entries = (action === 'SELL') ? generateReverseEntries(entryLow, entryStep, config.entryCount) : generateEntries(entryLow, entryStep, config.entryCount);

  // Generate and send messages
  const messages = generateMessages(action, symbol, entries, entryTPs, sl, entryLotSize);
  sendMessages(messages, config.channelUsername, config.broadcast);

  console.log('======');
  console.log(messages);
});

// Extracts symbol, action, entryLow, entryHigh, and entryPrice from the chat text
function extractSymbolActionEntry(chatText) {
    const symbolMatches = chatText.match(/(XAUUSD|XAU\/USD)/i);
    const symbol = symbolMatches ? symbolMatches[0].replace("/", "") : null;
  
    const actionMatches = chatText.match(/(BUY|SELL)/i);
    const action = actionMatches ? actionMatches[0] : null;
  
    const entryPriceMatches = chatText.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
    const entryLow = entryPriceMatches ? parseFloat(action === 'BUY' ? entryPriceMatches[1] : entryPriceMatches[2]) : null;
    const entryHigh = entryPriceMatches ? parseFloat(action === 'BUY' ? entryPriceMatches[2] : entryPriceMatches[1]) : null;
    const entryPrice = entryPriceMatches ? entryPriceMatches[1] : null;
  
    return { symbol, action, entryLow, entryHigh, entryPrice };
}
  

// Extracts TP1, TP2, and SL from the chat text
function extractTPLevels(chatText) {
  const tpSlMatches = chatText.match(/TP (\d+(?:\.\d+)?)|SL (\d+(?:\.\d+)?)/g);
  let tp1, tp2, sl;

  if (tpSlMatches) {
    for (const match of tpSlMatches) {
      const parts = match.split(' ');
      if (parts[0] === 'TP') {
        if (!tp1) {
          tp1 = parseFloat(parts[1]);
        } else {
          tp2 = parseFloat(parts[1]);
        }
      } else if (parts[0] === 'SL') {
        sl = parseFloat(parts[1]);
      }
    }
  }

  return { tp1, tp2, sl };
}

// Calculates the lot size per entry
function calculateEntryLotSize(lotSize, entryCount) {
  return lotSize / entryCount;
}

// Calculates the individual entry step
function calculateEntryStep(entryLow, entryHigh, entryCount) {
  return (entryHigh - entryLow) / (entryCount - 1);
}

// Calculates the entry TP values
function calculateEntryTPs(action, entryLow, entryPrice, tp1, tp2, profitPips) {
  const entryTPs = [];

  if (profitPips === 0) {
    for (let i = 0; i < 7; i++) {
      if ((action === 'BUY' && i < 5) || (action === 'SELL' && i > 1)) {
        entryTPs.push(entryLow + (defaultTP1Pips * 0.01));
      } else {
        entryTPs.push(entryLow + (defaultTP2Pips * 0.01));
      }
    }
  } else {
    const pips = profitPips * 0.01;
    for (let i = 0; i < 7; i++) {
      entryTPs.push(parseFloat(entryPrice) + pips);
    }
  }

  return entryTPs;
}

// Generates entries array
function generateEntries(entryLow, entryStep, entryCount) {
  return [...Array(entryCount)].map((_, i) => (entryLow + (entryStep * i)).toFixed(2));
}

// Generates reverse entries array
function generateReverseEntries(entryLow, entryStep, entryCount) {
  return [...Array(entryCount)].map((_, i) => (entryLow + (entryStep * (entryCount - 1 - i))).toFixed(2));
}

// Generates the messages
function generateMessages(action, symbol, entries, entryTPs, sl, entryLotSize) {
  const messages = [];

  for (let i = 0; i < entries.length; i++) {
    const entryPrice = entries[i];
    const entryTP = entryTPs[i];

    const message = `${action} ${symbol}\n`
      + `ENTRY: ${entryPrice}\n`
      + `Lot Size: ${entryLotSize.toFixed(2)}\n`
      + `TP: ${entryTP.toFixed(2)}\n`
      + `SL: ${sl}`;

    messages.push(message);
  }

  return messages;
}

// Sends the messages
function sendMessages(messages, channelUsername, broadcast) {
  for (const message of messages) {
    console.log('======');
    console.log(message);

    if (broadcast) {
      bot.telegram.sendMessage(channelUsername, message);
    }
  }
}

bot.launch();
