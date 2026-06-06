const express = require('express');
const router  = express.Router();
const Student    = require('../models/Student');
const Room       = require('../models/Room');
const FeePayment = require('../models/FeePayment');
const Complaint  = require('../models/Complaint');
const Visitor    = require('../models/Visitor');

router.get('/', async (req, res) => {
  try {
    const [
      totalStudents, activeStudents, pendingStudents,
      totalRooms, occupiedRooms, availableRooms, maintenanceRooms,
      totalComplaints, openComplaints, inProgressComplaints, resolvedComplaints,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'active' }),
      Student.countDocuments({ status: 'pending' }),
      Room.countDocuments(),
      Room.countDocuments({ status: 'occupied' }),
      Room.countDocuments({ status: 'available' }),
      Room.countDocuments({ status: 'maintenance' }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'open' }),
      Complaint.countDocuments({ status: 'in_progress' }),
      Complaint.countDocuments({ status: 'resolved' }),
    ]);

    // Fee aggregation
    const feeAgg = await FeePayment.aggregate([
      {
        $group: {
          _id: null,
          collected:     { $sum: { $cond: [{ $eq: ['$status', 'paid'] },    '$amount', 0] } },
          pending_count: { $sum: { $cond: [{ $in: ['$status', ['pending', 'overdue']] }, 1, 0] } },
        }
      }
    ]);
    const fees = feeAgg[0] || { collected: 0, pending_count: 0 };

    // Visitors today
    const todayStart = new Date(); todayStart.setHours(0,  0,  0,   0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const visitorsToday = await Visitor.countDocuments({
      check_in: { $gte: todayStart, $lte: todayEnd }
    });

    res.json({
      students:   { total: totalStudents, active: activeStudents, pending: pendingStudents },
      rooms:      { total: totalRooms, occupied: occupiedRooms, available: availableRooms, maintenance: maintenanceRooms },
      fees:       { collected: fees.collected || 0, pending_count: fees.pending_count || 0 },
      complaints: { total: totalComplaints, open_count: openComplaints, in_progress: inProgressComplaints, resolved: resolvedComplaints },
      visitors:   { today: visitorsToday },
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
