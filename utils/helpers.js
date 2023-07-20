// utils/helpers.js
const defaultTP1Pips = 20;
const defaultTP2Pips = 40;

// Extracts symbol, action, entryLow, entryHigh, and entryPrice from the chat text
function extractSymbolActionEntry(chatText) {
  const symbolMatches = chatText.match(/(XAUUSD|XAU\/USD)/i);
  const symbol = symbolMatches ? symbolMatches[0].replace("/", "") : null;

  const actionMatches = chatText.match(/(BUY|SELL)/i);
  const action = actionMatches ? actionMatches[0] : null;

  // Extract entryPrice
  let entryPriceMatches;
  let entryLow = 0;
  let entryHigh = 0;
  let entryPrice = 0;
  entryPriceMatches = chatText.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if(entryPriceMatches) {
    entryLow = entryPriceMatches ? parseFloat(action === 'BUY' ? entryPriceMatches[1] : entryPriceMatches[2]) : null;
    entryHigh = entryPriceMatches ? parseFloat(action === 'BUY' ? entryPriceMatches[2] : entryPriceMatches[1]) : null;
    entryPrice = entryPriceMatches ? entryPriceMatches[1] : null;
  } else {
    entryPriceMatches = chatText.match(/@(?:\s*)(\d+(?:\.\d+)?)/);
    entryPrice = entryPriceMatches[1];
    if(action == 'BUY') {
      entryHigh = parseFloat(entryPriceMatches[1]);
      entryLow = entryHigh - (200 * 0.01);
    } else {
      // SELL
      entryLow = parseFloat(entryPriceMatches[1]);
      entryHigh = entryLow + (200 * 0.01);
    }
    console.log('Single entry');
  }

  // console.log('entryPriceMatches: ', entryPriceMatches);
  console.log(`Symbol: ${symbol}`);
  console.log(`Action: ${action}`);
  console.log(`Entry High: ${entryHigh}`);
  console.log(`Entry Low: ${entryLow}`);

  return { symbol, action, entryLow, entryHigh, entryPrice };
}


// Extracts TP1, TP2, and SL from the chat text
function extractTPLevels(chatText) {
let tpSlMatches;
let tp1, tp2, sl;

tpSlMatches = chatText.match(/TP (\d+(?:\.\d+)?)|SL (\d+(?:\.\d+)?)/g);



if (tpSlMatches) {
  for (const match of tpSlMatches) {
    const parts = match.split(' ');
    if (parts[0] === 'TP') {
      if (!tp1) {
        tp1 = parseFloat(parts[1]);
      } else {
        tp2 = parseFloat(parts[1]);
      }
    } else if (parts[0] === 'SL' || parts[0] == 'Sl') {
      sl = parseFloat(parts[1]);
    }
  }
} else {
  const slMatches = chatText.match(/Sl\s*:\s*(\d+(?:\.\d+)?)/i);
  sl = slMatches ? parseFloat(slMatches[1]) : null;

  const tp1Matches = chatText.match(/Tp1\s*:\s*(\d+(?:\.\d+)?)/i);
  tp1 = tp1Matches ? parseFloat(tp1Matches[1]) : null;

  const tp2Matches = chatText.match(/Tp2\s*:\s*(\d+(?:\.\d+)?)/i);
  tp2 = tp2Matches ? parseFloat(tp2Matches[1]) : null;
}

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
  let entryTP;
  if(action == 'BUY') {
    entryTP = parseFloat(entryPrice) + (parseFloat(process.env.PROFIT_PIPS) * 0.01);
  } else {
    entryTP = parseFloat(entryPrice) - (parseFloat(process.env.PROFIT_PIPS) * 0.01);
  }

  const message = `${symbol} ${action} LIMIT @${entryPrice}\n`
    + `LOT: ${entryLotSize.toFixed(2)}\n`
    + `TP: ${entryTP.toFixed(2)}\n`
    + `SL: ${sl}`;

  // Generate console.log  
  // console.log(`${symbol} ${action} LIMIT @${entryPrice} LOT: ${entryLotSize.toFixed(2)} TP: ${entryTP.toFixed(2)} SL: ${sl}`);
  // console.log(message);

  messages.push(message);
}

return messages;
}

// Sends the messages
function sendMessages(messages, channelUsername, broadcast) {
for (const message of messages) {
  console.log('======');
  console.log(message);
  // console.log(message.replace("\n", " "));

  if (broadcast) {
    console.log('BROADCAST ENABLED');
    bot.telegram.sendMessage(channelUsername, message);
  } else {
    console.log('BROADCAST DISABLED');
  }
}
}


module.exports = {
  extractSymbolActionEntry,
  extractTPLevels,
  calculateEntryLotSize,
  calculateEntryStep,
  calculateEntryTPs,
  generateEntries,
  generateReverseEntries,
  generateMessages,
  sendMessages,
};
