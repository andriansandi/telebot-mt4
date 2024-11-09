// src/index.js
const { bot } = require('./bot/bot');

// Launch the bot
bot.launch().then(() => {
  console.log('Bot started!');
});
