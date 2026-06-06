const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
  student:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount:       { type: Number, required: true },
  month:        { type: String, required: true },
  payment_date: { type: Date, required: true },
  method:       { type: String, enum: ['cash', 'bank_transfer', 'online'], default: 'cash' },
  status:       { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
  receipt_no:   { type: String, unique: true, sparse: true },
  notes:        { type: String },
}, { timestamps: true });

module.exports = mongoose.model('FeePayment', feePaymentSchema);
