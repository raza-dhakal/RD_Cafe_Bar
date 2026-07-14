const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  category:     { type: String, default: 'other' }, // milk, coffee, drinks, cake, food, packaging, other
  unit:         { type: String, default: 'pcs' },   // L, kg, pcs, boxes...
  currentStock: { type: Number, default: 0 },
  sold:         { type: Number, default: 0 },        // used / sold count
  reorderLevel: { type: Number, default: 10 },       // low-stock threshold
  autoOrder:    { type: Boolean, default: false },   // auto-include in purchase order
  supplierName: { type: String, default: '' },
  supplierEmail:{ type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
