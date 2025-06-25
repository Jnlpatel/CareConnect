// server/routes/doctors.js
const express = require('express');
const Doctor  = require('../models/Doctor');
const { protect, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// @route   GET /api/doctors
// @desc    List all doctors for admin dropdown
// @access  Private/Admin
router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const doctors = await Doctor
      .find()
      .populate({ path: 'userId', select: 'name' });
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
