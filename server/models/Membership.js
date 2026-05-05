// Membership schema linking a user to a gym plan
const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'frozen'], default: 'active' },
  is_trial: { type: Boolean, default: false },
  amountPaid: { type: Number, required: true },
  autoRenew: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Membership', membershipSchema);
