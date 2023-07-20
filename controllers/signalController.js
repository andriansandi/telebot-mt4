// controllers/signalController.js
const {
  extractSymbolActionEntry,
  extractTPLevels,
  calculateEntryLotSize,
  calculateEntryStep,
  calculateEntryTPs,
  generateEntries,
  generateReverseEntries,
  generateMessages,
  sendMessages,
} = require('../utils/helpers');

const config = require('../config');

function handleSignal(ctx) {
  const chatText = ctx.message.text;
  console.log('CHAT TEXT: ' + chatText);
  // ... Rest of your code (including the parts that are in the "text" event handler)

  // console.log("==============");
  console.log('=> TBXMINER SIGNAL FORWARDER RADY <==');
  // const MetaApi = require('metaapi.cloud-sdk').default;
  // const token = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxZmNmNGZkNjQ1MjAwNTI5NTlhMGNmOGQ2MWNhN2FlMSIsInBlcm1pc3Npb25zIjpbXSwiYWNjZXNzUnVsZXMiOlt7ImlkIjoidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpIiwibWV0aG9kcyI6WyJ0cmFkaW5nLWFjY291bnQtbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibWV0YWFwaS1yZXN0LWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibWV0YWFwaS1ycGMtYXBpIiwibWV0aG9kcyI6WyJtZXRhYXBpLWFwaTp3czpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibWV0YWFwaS1yZWFsLXRpbWUtc3RyZWFtaW5nLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFzdGF0cy1hcGkiLCJtZXRob2RzIjpbIm1ldGFzdGF0cy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoicmlzay1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsicmlzay1tYW5hZ2VtZW50LWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJjb3B5ZmFjdG9yeS1hcGkiLCJtZXRob2RzIjpbImNvcHlmYWN0b3J5LWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtdC1tYW5hZ2VyLWFwaSIsIm1ldGhvZHMiOlsibXQtbWFuYWdlci1hcGk6cmVzdDpkZWFsaW5nOio6KiIsIm10LW1hbmFnZXItYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX1dLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiMWZjZjRmZDY0NTIwMDUyOTU5YTBjZjhkNjFjYTdhZTEiLCJpYXQiOjE2ODk0MDI3NDl9.YOY7qnGk0avobriyhA-NPCbAT-nunjwtsU7XNitaztzX87EhLvQAhtWsWNWMGqA1-Qy1OtT40LmMIKkf4rAvixwzhslqGEfdYKLw6n3zx0Q3ec7YTJy3cNN_IPaZMokjlNZSKAMjNHJB8gQ-zpGpcJlxQuz26HShG8DDUSHk322FynmmMq9rxjNwe5rrRRv3EpU8YN8cm1PUzwhdXCyDm-uAYzUQOxaEutUCFwHcY10HTDSQNpjmO8dLO1buQC5GRs2kbDrLxzSSB2letrrLPdU-b0jDCbIysvTcIJGLpqArdh3-_mNcGikgLMpepvHQZcdkdkN6-CEc24UuqYazsjwMY4XrrpRc5se8eJFnH2tDsnQB5OJk9PwKj6_xkOcw2AbOAQGYDtPkpqRNjACvUdqY1xlw9hp1xXqQXxwwX1YuxXEMEKDee1uHmgjPwoQeDEim-8FD4lHNCHp8vWcg4B_8r0BA2I7zDtg7DBAkUD_Nf6r2FnKaCBnZrLFHEiFeDgRVQAym3hiwk0-rNmJe1cXOc6oNt1KQj_hNmmNBVbPlS-fe_g2Svwawvlrs6NAibF8OeFzGtTs1XAPbqN0D_qoArWoseHJXHOr-eLxJ7UJXu--I3jtZ4iJE_i3HlIeJCSSGJ8hPg8p_XNkiqbYcQHcX4sD-0036-qNY816Ny3o';
  // const accountId = '0dcc7a20-6163-48e2-a5cf-ab2f5bf69afd';

  // const metaApi = new MetaApi(token);

  // const account = await metaApi.metatraderAccountApi.getAccount(accountId);

  // account.on('trade', (trade) => {
  //   // Handle trade update
  // });
  
  // account.on('order', (order) => {
  //   // Handle order update
  // });
  
  // account.on('state', (state) => {
  //   // Handle terminal state update
  // });
  
  // const orderId = await account.createOrder({
  //   symbol: 'EURUSD',
  //   type: 'MARKET',
  //   volume: 0.01,
  //   stopLoss: 1.2,
  //   takeProfit: 1.4
  // });
  


  // Extract symbol, action, entryLow, and entryHigh
  const { symbol, action, entryLow, entryHigh, entryPrice } = extractSymbolActionEntry(chatText);

  // Extract TP levels
  const { tp1, tp2, sl } = extractTPLevels(chatText);

  // Calculate lot size per entry
  const entryLotSize = calculateEntryLotSize(config.lotSize, config.entryCount);

  // Calculate individual entry step
  const entryStep = calculateEntryStep(entryLow, entryHigh, config.entryCount);

  // Calculate entryTP values
  const entryTPs = calculateEntryTPs(action, entryLow, entryPrice, tp1, tp2, config.profitPips);

  // Reverse the entry array when the action is "SELL"
  const entries = (action === 'SELL') ? generateReverseEntries(entryLow, entryStep, config.entryCount) : generateEntries(entryLow, entryStep, config.entryCount);

  // Generate and send messages
  const messages = generateMessages(action, symbol, entries, entryTPs, sl, entryLotSize);
  // sendMessages(messages, config.channelUsername, config.broadcast);
}

module.exports = {
  handleSignal,
};
