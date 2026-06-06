const express = require('express');
const router = express.Router();
const Room    = require('../models/Room');
const Student = require('../models/Student');

// Helper: count active occupants per room
async function getOccupantsMap(roomIds) {
  const counts = await Student.aggregate([
    { $match: { room: { $in: roomIds }, status: 'active' } },
    { $group: { _id: '$room', count: { $sum: 1 } } }
  ]);
  const map = {};
  counts.forEach(c => { map[c._id.toString()] = c.count; });
  return map;
}

// GET all rooms with occupant count
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ block: 1, floor: 1, room_number: 1 }).lean();
    const ids = rooms.map(r => r._id);
    const occMap = await getOccupantsMap(ids);
    const result = rooms.map(r => ({ ...r, id: r._id, occupants: occMap[r._id.toString()] || 0 }));
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET available rooms (not full, not maintenance)
router.get('/available', async (req, res) => {
  try {
    const rooms = await Room.find({ status: { $ne: 'maintenance' } }).sort({ block: 1, room_number: 1 }).lean();
    const ids = rooms.map(r => r._id);
    const occMap = await getOccupantsMap(ids);
    const result = rooms
      .map(r => ({ ...r, id: r._id, occupants: occMap[r._id.toString()] || 0 }))
      .filter(r => r.occupants < r.capacity);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST create room
router.post('/', async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ id: room._id, message: 'Room created' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update room
router.put('/:id', async (req, res) => {
  try {
    const { status, monthly_fee, capacity } = req.body;
    await Room.findByIdAndUpdate(req.params.id, { status, monthly_fee, capacity });
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
