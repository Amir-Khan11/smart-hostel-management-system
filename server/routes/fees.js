const express    = require('express');
const router     = express.Router();
const FeePayment = require('../models/FeePayment');
const Student    = require('../models/Student');

// GET all fee payments (populated)
router.get('/', async (req, res) => {
  try {
    const fees = await FeePayment.find()
      .populate({
        path: 'student',
        select: 'full_name student_id room',
        populate: { path: 'room', select: 'room_number block' }
      })
      .sort({ createdAt: -1 })
      .lean();

    const result = fees.map(f => ({
      ...f,
      id:          f._id,
      full_name:   f.student?.full_name   || 'Unknown',
      student_id:  f.student?.student_id  || '',
      room_number: f.student?.room?.room_number || null,
    }));
    res.json(result);
  } catch (err) {
    console.error('Fees GET error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET summary — aggregation pipeline
router.get('/summary', async (req, res) => {
  try {
    // Overall totals
    const totalsAgg = await FeePayment.aggregate([
      {
        $group: {
          _id:           null,
          collected:     { $sum: { $cond: [{ $eq: ['$status', 'paid']    }, '$amount', 0] } },
          pending:       { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
          overdue:       { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, '$amount', 0] } },
          total_records: { $sum: 1 },
        }
      }
    ]);
    const totals = totalsAgg[0] || { collected: 0, pending: 0, overdue: 0, total_records: 0 };
    delete totals._id;

    // Per-block breakdown using two $lookup stages
    const byBlockAgg = await FeePayment.aggregate([
      {
        $lookup: {
          from:         'students',
          localField:   'student',
          foreignField: '_id',
          as:           'studentDoc'
        }
      },
      {
        $unwind: {
          path: '$studentDoc',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from:         'rooms',
          localField:   'studentDoc.room',
          foreignField: '_id',
          as:           'roomDoc'
        }
      },
      {
        $unwind: {
          path: '$roomDoc',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id:       { $ifNull: ['$roomDoc.block', 'Unknown'] },
          collected: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } },
          total:     { $sum: '$amount' },
        }
      },
      {
        $project: { _id: 0, block: '$_id', collected: 1, total: 1 }
      },
      { $sort: { block: 1 } }
    ]);

    res.json({ totals, byBlock: byBlockAgg });
  } catch (err) {
    console.error('Fees summary error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST record payment
router.post('/', async (req, res) => {
  try {
    const { student_id, amount, month, payment_date, method, status, notes } = req.body;
    const receipt_no = status === 'paid' ? `RCP-${Date.now()}` : undefined;
    const fee = await FeePayment.create({
      student: student_id, amount, month, payment_date,
      method, status, receipt_no, notes
    });
    res.status(201).json({ id: fee._id, receipt_no });
  } catch (err) {
    console.error('Fees POST error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT update payment status
router.put('/:id', async (req, res) => {
  try {
    const { status, method, payment_date } = req.body;
    const update = { status, method, payment_date };
    if (status === 'paid') {
      const existing = await FeePayment.findById(req.params.id);
      if (existing && !existing.receipt_no) {
        update.receipt_no = `RCP-${Date.now()}`;
      }
    }
    await FeePayment.findByIdAndUpdate(req.params.id, update);
    res.json({ message: 'Updated', receipt_no: update.receipt_no });
  } catch (err) {
    console.error('Fees PUT error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
