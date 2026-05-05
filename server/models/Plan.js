// Plan schema for subscription types (Monthly, Semester, Yearly)
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  durationDays: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  max_users_limit: { type: Number, required: true, default: 100 },
  is_seasonal_discount: { type: Boolean, default: false },
  discount_start: { type: Date },
  discount_end: { type: Date },
  discount_percentage: { type: Number, default: 0 },
  isCombo: { type: Boolean, default: false },
  comboIncludes: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
