// config/index.js
require('dotenv').config();

const config = {
  channelUsername: process.env.CHANNEL_USERNAME,
  lotSize: parseFloat(process.env.LOT_SIZE),
  entryCount: parseInt(process.env.ENTRY_COUNT),
  profitPips: parseFloat(process.env.PROFIT_PIPS),
  broadcast: process.env.BROADCAST === 'TRUE',
};

module.exports = config;