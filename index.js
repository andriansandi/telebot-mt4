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

  // console.log("==============");
  console.log('=> TBXMINER SIGNAL FORWARDER RADY <==');
  // const MetaApi = require('metaapi.cloud-sdk').default;
  // const token = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxZmNmNGZkNjQ1MjAwNTI5NTlhMGNmOGQ2MWNhN2FlMSIsInBlcm1pc3Npb25zIjpbXSwiYWNjZXNzUnVsZXMiOlt7ImlkIjoidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpIiwibWV0aG9kcyI6WyJ0cmFkaW5nLWFjY291bnQtbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibWV0YWFwaS1yZXN0LWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibWV0YWFwaS1ycGMtYXBpIiwibWV0aG9kcyI6WyJtZXRhYXBpLWFwaTp3czpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibWV0YWFwaS1yZWFsLXRpbWUtc3RyZWFtaW5nLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFzdGF0cy1hcGkiLCJtZXRob2RzIjpbIm1ldGFzdGF0cy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoicmlzay1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsicmlzay1tYW5hZ2VtZW50LWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJjb3B5ZmFjdG9yeS1hcGkiLCJtZXRob2RzIjpbImNvcHlmYWN0b3J5LWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtdC1tYW5hZ2VyLWFwaSIsIm1ldGhvZHMiOlsibXQtbWFuYWdlci1hcGk6cmVzdDpkZWFsaW5nOio6KiIsIm10LW1hbmFnZXItYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX1dLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiMWZjZjRmZDY0NTIwMDUyOTU5YTBjZjhkNjFjYTdhZTEiLCJpYXQiOjE2ODk0MDI3NDl9.YOY7qnGk0avobriyhA-NPCbAT-nunjwtsU7XNitaztzX87EhLvQAhtWsWNWMGqA1-Qy1OtT40LmMIKkf4rAvixwzhslqGEfdYKLw6n3zx0Q3ec7YTJy3cNN_IPaZMokjlNZSKAMjNHJB8gQ-zpGpcJlxQuz26HShG8DDUSHk322FynmmMq9rxjNwe5rrRRv3EpU8YN8cm1PUzwhdXCyDm-uAYzUQOxaEutUCFwHcY10HTDSQNpjmO8dLO1buQC5GRs2kbDrLxzSSB2letrrLPdU-b0jDCbIysvTcIJGLpqArdh3-_mNcGikgLMpepvHQZcdkdkN6-CEc24UuqYazsjwMY4XrrpRc5se8eJFnH2tDsnQB5OJk9PwKj6_xkOcw2AbOAQGYDtPkpqRNjACvUdqY1xlw9hp1xXqQXxwwX1YuxXEMEKDee1uHmgjPwoQeDEim-8FD4lHNCHp8vWcg4B_8r0BA2I7zDtg7DBAkUD_Nf6r2FnKaCBnZrLFHEiFeDgRVQAym3hiwk0-rNmJe1cXOc6oNt1KQj_hNmmNBVbPlS-fe_g2Svwawvlrs6NAibF8OeFzGtTs1XAPbqN0D_qoArWoseHJXHOr-eLxJ7UJXu--I3jtZ4iJE_i3HlIeJCSSGJ8hPg8p_XNkiqbYcQHcX4sD-0036-qNY816Ny3o';
  // const accountId = '0dcc7a20-6163-48e2-a5cf-ab2f5bf69afd';

  // const metaApi = new MetaApi(token);

  // const account = await metaApi.metatraderAccountApi.getAccount(accountId);

  // account.on('trade', (trade) => {
  //   // Handle trade update
  // });
  
  // account.on('order', (order) => {
  //   // Handle order update
  // });
  
  // account.on('state', (state) => {
  //   // Handle terminal state update
  // });
  
  // const orderId = await account.createOrder({
  //   symbol: 'EURUSD',
  //   type: 'MARKET',
  //   volume: 0.01,
  //   stopLoss: 1.2,
  //   takeProfit: 1.4
  // });
  


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

  
  // console.log(messages);
});

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
      // bot.telegram.sendMessage(channelUsername, message);
    }
  }
}

bot.launch();
