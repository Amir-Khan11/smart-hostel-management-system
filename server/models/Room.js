const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  room_number: { type: String, required: true, unique: true, trim: true },
  block:       { type: String, required: true, uppercase: true, trim: true },
  floor:       { type: Number, required: true },
  capacity:    { type: Number, required: true, default: 2 },
  status:      { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  monthly_fee: { type: Number, required: true, default: 5000 },
}, { timestamps: true });

// Virtual: occupants count (populated at query time)
roomSchema.virtual('occupants', { ref: 'Student', localField: '_id', foreignField: 'room', count: true });

module.exports = mongoose.model('Room', roomSchema);
