const mongoose = require('mongoose');

const SparePartSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, enum: ['Critical', 'Consumable', 'General'], default: 'General' },
  
  annualDemand: { type: Number, required: true },
  orderingCost: { type: Number, required: true }, 
  unitPrice: { type: Number, required: true },
  holdingCostRate: { type: Number, required: true }, 
  leadTimeDays: { type: Number, required: true },
  safetyStock: { type: Number, default: 0 },
  
  currentStock: { type: Number, required: true },
});

SparePartSchema.virtual('eoq').get(function() {
  const H = this.unitPrice * (this.holdingCostRate / 100);
  return Math.ceil(Math.sqrt((2 * this.annualDemand * this.orderingCost) / H));
});

SparePartSchema.virtual('reorderPoint').get(function() {
  const dailyDemand = this.annualDemand / 365;
  return Math.ceil((dailyDemand * this.leadTimeDays) + this.safetyStock);
});

SparePartSchema.virtual('status').get(function() {
  if (this.currentStock <= this.reorderPoint) return 'Reorder Now';
  if (this.currentStock <= this.reorderPoint * 1.2) return 'Low Stock';
  return 'Healthy';
});

SparePartSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('SparePart', SparePartSchema);