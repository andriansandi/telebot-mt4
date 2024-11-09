// config/config.js
require('dotenv').config();

module.exports = {
  botToken: process.env.BOT_TOKEN,
  channelUsername: process.env.CHANNEL_USERNAME,
  lotSize: parseFloat(process.env.LOT_SIZE),
  entryCount: parseInt(process.env.ENTRY_COUNT, 10),
  profitPips: parseFloat(process.env.PROFIT_PIPS),
  spreadPips: parseFloat(process.env.SPREAD_PIPS),
  broadcast: process.env.BROADCAST === 'TRUE',
};