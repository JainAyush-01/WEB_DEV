const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entry_time: { type: Date, required: true },
  exit_time: { type: Date },
  duration_minutes: { type: Number, default: 0 } // Ignore if < 30
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
