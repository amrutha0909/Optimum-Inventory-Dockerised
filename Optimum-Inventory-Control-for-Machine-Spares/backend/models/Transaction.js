const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  sku: { type: String, required: true },
  type: { type: String, enum: ['IN', 'OUT', 'DELETED', 'CREATED'], required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);