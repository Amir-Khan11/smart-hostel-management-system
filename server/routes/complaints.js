const express   = require('express');
const router    = express.Router();
const Complaint = require('../models/Complaint');

// GET all complaints
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate({ path: 'student', select: 'full_name student_id room', populate: { path: 'room', select: 'room_number' } })
      .sort({ createdAt: -1 })
      .lean();
    const result = complaints.map(c => ({
      ...c,
      id:          c._id,
      full_name:   c.student?.full_name,
      student_id:  c.student?.student_id,
      room_number: c.student?.room?.room_number || null,
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST submit complaint
router.post('/', async (req, res) => {
  try {
    const { student_id, category, title, description, priority } = req.body;
    const complaint = await Complaint.create({ student: student_id, category, title, description, priority });
    res.status(201).json({ id: complaint._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'resolved') update.resolved_at = new Date();
    await Complaint.findByIdAndUpdate(req.params.id, update);
    res.json({ message: 'Status updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE complaint
router.delete('/:id', async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
