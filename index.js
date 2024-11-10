const tls = require('tls');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const log = console.log;

// Increase the maximum number of listeners for TLSSocket
tls.DEFAULT_MAX_LISTENERS = 20;

const bot = new Telegraf(process.env.BOT_TOKEN);

// Define the configurable parameters
const config = {
  channelUsername: process.env.CHANNEL_USERNAME,
  lotSize: parseFloat(process.env.LOT_SIZE),
  entryCount: parseInt(process.env.ENTRY_COUNT),
  profitPips: parseFloat(process.env.PROFIT_PIPS),
  spreadPips: parseFloat(process.env.SPREAD_PIPS), // Add the spread configuration
  broadcast: process.env.BROADCAST === 'TRUE',
};

// Set default TP values
const defaultTP1Pips = 20;
const defaultTP2Pips = 40;
entryLotSize = 0.01;
let entrys = [];

// Set MaxListener 
// process.setMaxListeners(20);

// Start command handler
bot.command('start', ctx => {
  console.log('Bot Started!');
  console.log('User: ', ctx.from);  
  bot.telegram.sendMessage(ctx.chat.id, 'Hello!, I am TBXMINER BOT that will forwarded your signal', {});
});

// Handling bot
bot.on('text', async (ctx) => {
  const chatText = ctx.message.text;
  console.log('=> TBXMINER SIGNAL FORWARDER READY <==');

  // clear entrys console.table
  entrys.length = 0;

  // Extract symbol and action
  const symbol = extractSymbol(chatText);
  const action = extractAction(chatText);

  if (!symbol || !action) {
    return; // If either symbol or action is not found, stop processing
  }

  // Extract entry details based on action (BUY/SELL)
  const { entryLow, entryHigh, entryPrice } = extractEntryDetails(chatText, action);

  // Extract TP levels
  const { tp1, tp2, sl } = extractTPLevels(chatText);

  // Calculate lot size per entry
  let entryLotSize = config.lotSize <= 0 ? calculateEntryLotSize(config.lotSize, config.entryCount) : config.lotSize;

  // Calculate individual entry step
  const entryStep = calculateEntryStep(entryLow, entryHigh, config.entryCount);

  // Calculate entryTP values
  const entryTPs = calculateEntryTPs(action, entryLow, entryPrice, tp1, tp2, config.profitPips);

  // Reverse the entry array when the action is "SELL"
  const entries = (action === 'SELL') ? generateReverseEntries(entryLow, entryStep, config.entryCount) : generateEntries(entryLow, entryStep, config.entryCount);
  // Generate and send messages
  const messages = generateMessages(action, symbol, entries, tp1, sl, entryLotSize);

  console.table(entrys);

  sendMessages(messages, config.channelUsername, config.broadcast, entries);
});

// Extract symbol from chat text
function extractSymbol(chatText) {
  const symbolMatches = chatText.match(/\b([A-Z]{3}\/?[A-Z]{3}|GOLD|Gold|XAUUSD|XAU\/USD)\b/i);
  let symbol = symbolMatches ? symbolMatches[0].replace("/", "") : null; // Remove '/' for uniformity

  // Convert any "Gold" or "GOLD" instances to "XAUUSD"
  if (symbol && /Gold|GOLD/i.test(symbol)) {
    symbol = 'XAUUSD';
  }

  if (!symbol) {
    console.error("Error: Symbol not detected. Please check the input format.");
    return null;  // Return null if no symbol is detected
  }

  console.log(`Detected symbol: ${symbol}`);
  return symbol;
}

// Extract action (BUY/SELL) from chat text
function extractAction(chatText) {
  const actionMatches = chatText.match(/(BUY|SELL)/i);
  const action = actionMatches ? actionMatches[0].toUpperCase() : null;

  if (!action) {
    console.error("Error: Action (BUY/SELL) not detected.");
    return null;  // Return null if no action is detected
  }

  console.log(`Detected action: ${action}`);
  return action;
}

// Extract entry details (entryLow, entryHigh, entryPrice) from chat text
function extractEntryDetails(chatText, action) {
  let entryLow = 0;
  let entryHigh = 0;
  let entryPrice = 0;

  // Match entry ranges like '2685.20 - 2689.20'
  let entryPriceMatches = chatText.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (entryPriceMatches) {
    entryLow = parseFloat(action === 'BUY' ? entryPriceMatches[1] : entryPriceMatches[2]);
    entryHigh = parseFloat(action === 'BUY' ? entryPriceMatches[2] : entryPriceMatches[1]);
    entryPrice = entryLow; // Use entryLow as the initial price for further processing
  } else {
    // Match single '@' entry values like '@ 2685.20'
    entryPriceMatches = chatText.match(/@(?:\s*)(\d+(?:\.\d+)?)/);
    if (entryPriceMatches) {
      entryPrice = parseFloat(entryPriceMatches[1]);
      if (action === 'BUY') {
        entryHigh = entryPrice;
        entryLow = entryHigh - (200 * 0.01); // Example adjustment for entry range
      } else {
        entryLow = entryPrice;
        entryHigh = entryLow + (200 * 0.01); // Example adjustment for entry range
      }
      console.log('Single entry detected');
    }
  }

  console.log(`Entry Low: ${entryLow}`);
  console.log(`Entry High: ${entryHigh}`);
  console.log(`Entry Price: ${entryPrice}`);

  return { entryLow, entryHigh, entryPrice };
}

// Extracts TP1, TP2, and SL from the chat text
function extractTPLevels(chatText) {
  let tp1, tp2, sl;

  // Match SL with optional special characters, followed by a number
  const slMatches = chatText.match(/SL\s*[^0-9]*\s*(\d+(?:\.\d+)?)/i);
  sl = slMatches ? parseFloat(slMatches[1]) : null;

  // Match TP1 and TP2, allowing for variations in formatting (e.g., "TP 1", "Tp1", etc.)
  const tpMatches = chatText.match(/TP\s*1\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
  tp1 = tpMatches ? parseFloat(tpMatches[1]) : null;

  const tp2Matches = chatText.match(/TP\s*2\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
  tp2 = tp2Matches ? parseFloat(tp2Matches[1]) : null;

  console.log(`TP1: ${tp1}`);
  console.log(`TP2: ${tp2}`);
  console.log(`SL: ${sl}`);

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

// Calculates the entry TP values with spread
function calculateEntryTPs(action, entryLow, entryPrice, tp1, tp2, profitPips, spreadPips) {
  const entryTPs = [];

  if (profitPips === 0) {
    for (let i = 0; i < 7; i++) {
      if ((action === 'BUY' && i < 5) || (action === 'SELL' && i > 1)) {
        entryTPs.push(entryLow + (defaultTP1Pips * 0.01) - (spreadPips * 0.01));
      } else {
        entryTPs.push(entryLow + (defaultTP2Pips * 0.01) - (spreadPips * 0.01));
      }
    }
  } else {
    const pips = (profitPips - spreadPips) * 0.01;
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
function generateMessages(action, symbol, entries, tp1, sl, entryLotSize) {
  const messages = [];
  let msg = [];

  for (let i = 0; i < entries.length; i++) {
    const entryPrice = entries[i];

    let message;
    let entryTP;
    if(action == 'BUY') {
      if(process.env.PROFIT_PIPS > 0) {
        entryTP = parseFloat(entryPrice) + (parseFloat(process.env.PROFIT_PIPS) * 0.01);
      } else {
        entryTP = tp1;
      }
    } else {
      if(process.env.PROFIT_PIPS > 0) {
        entryTP = parseFloat(entryPrice) - (parseFloat(process.env.PROFIT_PIPS) * 0.01);
      } else {
        entryTP = tp1;
      }
    }

    // Calculate with Spreads
    if(process.env.SPREAD_PIPS > 0) {
      entryWithSpreads = parseFloat(entryPrice) - (parseFloat(process.env.SPREAD_PIPS) * 0.01);
      slWithSpreads = parseFloat(sl) - (parseFloat(process.env.SPREAD_PIPS) * 0.01);
      tpWithSpreads = parseFloat(entryTP) - (parseFloat(process.env.SPREAD_PIPS) * 0.01);

      // generate message
      message = `${symbol} ${action} LIMIT @${entryWithSpreads.toFixed(2)}\n`
                + `LOT: ${entryLotSize.toFixed(2)}\n`
                + `TP: ${tpWithSpreads.toFixed(2)}\n`
                + `SL: ${slWithSpreads.toFixed(2)}`;

      // for logging
      entrys.push({
        'symbol': symbol,
        'action': action,
        'entry': entryWithSpreads.toFixed(2),
        'lot': entryLotSize.toFixed(2),
        'tp': tpWithSpreads.toFixed(2),
        'sl': slWithSpreads.toFixed(2)
      });
          
    } else {
      message = `${symbol} ${action} LIMIT @${parseFloat(entryPrice).toFixed(2)}\n`
                + `LOT: ${entryLotSize.toFixed(2)}\n`
                + `TP: ${entryTP.toFixed(2)}\n`
                + `SL: ${parseFloat(sl).toFixed(2)}`;

      // for logging
      entrys.push({
        'symbol': symbol,
        'action': action,
        'entry': parseFloat(entryPrice).toFixed(2),
        'lot': entryLotSize.toFixed(2),
        'tp': entryTP.toFixed(2),
        'sl': parseFloat(sl).toFixed(2)
      });
    }


    messages.push(message);
  }

  return messages;
}

// Sends the messages
function sendMessages(messages, channelUsername, broadcast) {
  for (const message of messages) {
    // log(chalk.yellow('======'));
    // console.table(entries);
    // console.log(message.replace("\n", " "));

    if (broadcast) {
      // console.log('BROADCAST ENABLED');
      bot.telegram.sendMessage(channelUsername, message);
    } else {
      // console.log('BROADCAST DISABLED');
    }
  }
}

bot.launch();