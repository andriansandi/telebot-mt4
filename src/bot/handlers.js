// src/bot/handlers.js
const { extractSymbolActionEntry, extractTPLevels } = require('../utils/extract');
const { calculateEntryLotSize, calculateEntryStep, calculateEntryTPs } = require('../utils/calculations');
const { generateMessages, sendMessages } = require('../utils/messages');
const config = require('../../config/config');

function handleText(ctx) {
  const chatText = ctx.message.text;

  // Extract symbol, action, entry details
  const { symbol, action, entryLow, entryHigh, entryPrice } = extractSymbolActionEntry(chatText);
  const { tp1, tp2, sl } = extractTPLevels(chatText);

  let entryLotSize = config.lotSize > 0 ? config.lotSize : calculateEntryLotSize(config.lotSize, config.entryCount);
  const entryStep = calculateEntryStep(entryLow, entryHigh, config.entryCount);
  const entryTPs = calculateEntryTPs(action, entryLow, entryPrice, tp1, tp2, config.profitPips);

  const entries = action === 'SELL'
    ? generateReverseEntries(entryLow, entryStep, config.entryCount)
    : generateEntries(entryLow, entryStep, config.entryCount);

  const messages = generateMessages(action, symbol, entries, tp1, sl, entryLotSize);
  sendMessages(messages, config.channelUsername, config.broadcast);
}

module.exports = { handleText };