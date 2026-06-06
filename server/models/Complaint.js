const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  category:    { type: String, enum: ['electrical','plumbing','furniture','wifi','cleanliness','security','other'], required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status:      { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  resolved_at: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
