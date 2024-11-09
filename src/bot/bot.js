// src/bot/bot.js
const { Telegraf } = require('telegraf');
const config = require('../../config/config');
const { handleText } = require('./handlers');

const bot = new Telegraf(config.botToken);

bot.command('start', (ctx) => {
  ctx.reply('Hello! I am TBXMINER BOT that will forward your signal.');
});

bot.on('text', handleText);

module.exports = { bot };