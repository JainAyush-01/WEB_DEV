const mongoose = require('mongoose');

const freezeRecordSchema = new mongoose.Schema({
  membership_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', required: true },
  freeze_start_date: { type: Date, required: true },
  freeze_end_date: { type: Date, required: true } // Max 10 days constraint handled in controller
}, { timestamps: true });

module.exports = mongoose.model('FreezeRecord', freezeRecordSchema);
