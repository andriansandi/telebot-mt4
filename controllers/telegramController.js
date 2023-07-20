// bot.js
const { Telegraf } = require('telegraf');
require('dotenv').config();

// Increase the maximum number of listeners for TLSSocket
const tls = require('tls');
tls.DEFAULT_MAX_LISTENERS = 20;

const bot = new Telegraf(process.env.BOT_TOKEN);

module.exports = bot;