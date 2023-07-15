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

    // Extract symbol, action, entryLow, and entryHigh
    const symbolActionRangeMatch = chatText.match(/([A-Z]+)\s+(SELL|BUY) NOW (\d+(?:\.\d+)?) - (\d+(?:\.\d+)?)/);
    if (symbolActionRangeMatch) {
        symbol = symbolActionRangeMatch[1];
        action = symbolActionRangeMatch[2];
        entryLow = parseFloat(symbolActionRangeMatch[3]);
        entryHigh = parseFloat(symbolActionRangeMatch[4]);
    }

    // Extract tp1, tp2, and sl
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
    entryLotSize = lotSize / entryCount;

    // Calculate individual entry step
    const entryStep = (entryHigh - entryLow) / (entryCount - 1);

    // Forward each entry as a separate message to the channel
    for (let i = 0; i < entryCount; i++) {
        const entryPrice = (entryLow + i * entryStep).toFixed(2);
        const entryTP = i <= 3 ? tp1 : tp2;
        
        const message = `${action} ${symbol}\n`
            + `ENTRY: ${entryPrice}\n`
            + `Lot Size: ${entryLotSize.toFixed(2)}\n`
            + `TP: ${entryTP}\n`
            + `SL: ${sl}`;

        console.log('======');
        console.log(message);

        // Forward each entry as a separate message to the channel
        bot.telegram.sendMessage(channelUsername, message);
    }
});



bot.launch();