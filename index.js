const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const channelUsername = process.env.CHANNEL_USERNAME;
const lotSize = parseFloat(process.env.LOT_SIZE);
const entryCount = parseInt(process.env.ENTRY_COUNT);

let symbol, action, entryLow, entryHigh, tp1, tp2, sl;

bot.command('start', ctx => {
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, 'hello there! Welcome to my new telegram aisia.', {
    })
});

bot.on('text', async (ctx) => {
    const chatText = ctx.message.text;

    console.log("==============");
    // Extract symbol, action, entryLow, and entryHigh
    const symbolMatches = chatText.match(/(XAUUSD|XAU\/USD)/i);
    if (symbolMatches) {
        symbol = symbolMatches[0].replace("/", "");
        console.log("SYMBOL: " + symbol);
    }

    // Extract action
    const actionMatches = chatText.match(/(BUY|SELL)/i);
    if (actionMatches) {
        action = actionMatches[0];
        console.log("ACTION: " + action);
    }

    // Extract entryHigh and entryLow
    const entryPriceMatches = chatText.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
    if (entryPriceMatches) {
        entryLow = parseFloat(action === 'BUY' ? entryPriceMatches[1] : entryPriceMatches[2]);
        entryHigh = parseFloat(action === 'BUY' ? entryPriceMatches[2] : entryPriceMatches[1]);
        console.log('Entry Low:', entryLow);
        console.log('Entry High:', entryHigh);
    } else {
        console.log('Entry low and entry high not found.');
    }

    // Extract TP levels
    const tpSlMatches = chatText.match(/TP (\d+(?:\.\d+)?)|SL (\d+(?:\.\d+)?)/g);
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

    // Calculate lot size per entry
    const entryLotSize = lotSize / entryCount;
    console.log("entryLotSize: " + entryLotSize);

    // Calculate individual entry step
    const entryStep = (entryHigh - entryLow) / (entryCount - 1);
    console.log("entryStep: " + entryStep);

    // Set default values for TP1 and TP2 if they are undefined
    if (typeof tp1 === 'undefined') {
        tp1 = entryLow + (20 * 0.01); // Set default TP1 as 20 pips above entryLow
    }
    if (typeof tp2 === 'undefined') {
        tp2 = entryLow + (40 * 0.01); // Set default TP2 as 40 pips above entryLow
    }

    // Reverse the entry array when the action is "SELL"
    const entries = action === 'SELL' ? [...Array(entryCount)].map((_, i) => entryLow + (entryStep * (entryCount - 1 - i))) : [...Array(entryCount)].map((_, i) => entryLow + (entryStep * i));

    // Forward each entry as a separate message to the channel
    for (let i = 0; i < entryCount; i++) {
        const entryPrice = entries[i].toFixed(2);

        // Calculate entryTP
        let entryTP;
        if (parseFloat(process.env.PROFIT_PIPS) === 0) {
            entryTP = (i < 5) ? tp1 : tp2;
        } else {
            const pips = parseFloat(process.env.PROFIT_PIPS);
            entryTP = parseFloat(entryPrice) + (pips * 0.01);
        }
        
        const message = `${action} ${symbol}\n`
            + `ENTRY: ${entryPrice}\n`
            + `Lot Size: ${entryLotSize.toFixed(2)}\n`
            + `TP: ${entryTP.toFixed(2)}\n`
            + `SL: ${sl}`;

        console.log('======');
        console.log(message);

        // Forward each entry as a separate message to the channel
        if(process.env.BROADCAST) bot.telegram.sendMessage(channelUsername, message);
    }
});

bot.launch();