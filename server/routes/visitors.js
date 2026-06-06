const express = require('express');
const router  = express.Router();
const Visitor = require('../models/Visitor');

// GET all visitors
router.get('/', async (req, res) => {
  try {
    const visitors = await Visitor.find()
      .populate({ path: 'student', select: 'full_name room', populate: { path: 'room', select: 'room_number' } })
      .sort({ check_in: -1 })
      .lean();
    const result = visitors.map(v => ({
      ...v,
      id:           v._id,
      student_name: v.student?.full_name || 'Unknown',
      room_number:  v.student?.room?.room_number || null,
    }));
    res.json(result);
  } catch (err) {
    console.error('Visitors GET error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST log visitor
router.post('/', async (req, res) => {
  try {
    const { visitor_name, cnic, phone, relation, student_id, check_in, purpose } = req.body;
    const visitor = await Visitor.create({ visitor_name, cnic, phone, relation, student: student_id, check_in, purpose });
    res.status(201).json({ id: visitor._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT checkout
router.put('/:id/checkout', async (req, res) => {
  try {
    await Visitor.findByIdAndUpdate(req.params.id, { check_out: new Date() });
    res.json({ message: 'Checked out' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
