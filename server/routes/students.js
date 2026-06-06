const express = require('express');
const router  = express.Router();
const Student = require('../models/Student');
const Room    = require('../models/Room');

// GET all students (populated with room info)
router.get('/', async (req, res) => {
  try {
    const students = await Student.find()
      .populate('room', 'room_number block floor monthly_fee')
      .sort({ createdAt: -1 })
      .lean();
    const result = students.map(s => ({
      ...s,
      id:          s._id,
      room_number: s.room?.room_number || null,
      block:       s.room?.block       || null,
      floor:       s.room?.floor       || null,
    }));
    res.json(result);
  } catch (err) {
    console.error('Students GET error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET single student
router.get('/:id', async (req, res) => {
  try {
    const s = await Student.findById(req.params.id)
      .populate('room', 'room_number block floor monthly_fee')
      .lean();
    if (!s) return res.status(404).json({ error: 'Student not found' });
    res.json({ ...s, id: s._id, room_number: s.room?.room_number, block: s.room?.block, floor: s.room?.floor });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST register student
router.post('/', async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ id: student._id, message: 'Student registered' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update student info
router.put('/:id', async (req, res) => {
  try {
    const { full_name, email, phone, department, cnic, guardian_name, guardian_phone, status } = req.body;
    await Student.findByIdAndUpdate(req.params.id, { full_name, email, phone, department, cnic, guardian_name, guardian_phone, status });
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT assign room (replaces MySQL transaction)
router.put('/:id/assign-room', async (req, res) => {
  try {
    const { room_id } = req.body;
    const room = await Room.findById(room_id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Count current active occupants
    const occupants = await Student.countDocuments({ room: room_id, status: 'active' });
    if (occupants >= room.capacity) return res.status(400).json({ error: 'Room is already at full capacity' });

    await Student.findByIdAndUpdate(req.params.id, { room: room_id, status: 'active' });

    // Update room status if now full
    const newCount = occupants + 1;
    if (newCount >= room.capacity) {
      await Room.findByIdAndUpdate(room_id, { status: 'occupied' });
    } else {
      await Room.findByIdAndUpdate(room_id, { status: 'available' });
    }

    res.json({ message: 'Room assigned successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
