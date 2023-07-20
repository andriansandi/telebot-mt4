// index.js
const bot = require('./controllers/telegramController');
const signalController = require('./controllers/signalController');


// Increase the maximum number of listeners for TLSSocket
require('tls').DEFAULT_MAX_LISTENERS = 20;


// Register the handlers
bot.command('start', signalController.handleSignal);
bot.on('text', signalController.handleSignal);

// Start the bot
bot.launch();