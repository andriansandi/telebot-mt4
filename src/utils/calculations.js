// src/utils/calculations.js
function calculateEntryLotSize(lotSize, entryCount) {
return lotSize / entryCount;
}

function calculateEntryStep(entryLow, entryHigh, entryCount) {
return (entryHigh - entryLow) / (entryCount - 1);
}

function calculateEntryTPs(action, entryLow, entryPrice, tp1, tp2, profitPips) {
// TP calculation logic...
}

module.exports = { calculateEntryLotSize, calculateEntryStep, calculateEntryTPs };