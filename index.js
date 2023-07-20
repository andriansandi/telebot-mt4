// index.js
const bot = require('./controllers/telegramController');
const signalController = require('./controllers/signalController');


// Increase the maximum number of listeners for TLSSocket
require('tls').DEFAULT_MAX_LISTENERS = 20;


// Register the handlers
bot.command('start', signalController.handleStart);
bot.command('sl', signalController.handleUpdateSL);
bot.command('bin', signalController.handleBuyMarket);
bot.command('be', signalController.handleSetBreakeven);
bot.on('text', signalController.handleSignal);

// Start the bot
bot.launch();