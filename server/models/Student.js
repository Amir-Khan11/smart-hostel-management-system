const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  student_id:     { type: String, required: true, unique: true, trim: true },
  full_name:      { type: String, required: true, trim: true },
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:          { type: String, trim: true },
  department:     { type: String, trim: true },
  cnic:           { type: String, trim: true },
  guardian_name:  { type: String, trim: true },
  guardian_phone: { type: String, trim: true },
  status:         { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
  room:           { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
  joined_date:    { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
