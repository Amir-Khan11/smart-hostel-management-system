const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  visitor_name: { type: String, required: true, trim: true },
  cnic:         { type: String, trim: true },
  phone:        { type: String, trim: true },
  relation:     { type: String, trim: true },
  student:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  check_in:     { type: Date, required: true },
  check_out:    { type: Date, default: null },
  purpose:      { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
