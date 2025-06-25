// server/routes/availability.js
const express = require('express');
const Availability = require('../models/Availability');
const Doctor = require('../models/Doctor');
const { protect, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// @route   POST /api/availability
// @desc    Add availability slot (doctor only)
// @access  Private/Doctor
router.post('/', protect, authorizeRoles('doctor'), async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    if (!doctorProfile) return res.status(400).json({ message: 'Doctor profile not found' });

    const slot = await Availability.create({
      doctorId: doctorProfile._id,
      date,
      startTime,
      endTime
    });
    res.status(201).json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/availability/doctor
// @desc    Get availability slots for current doctor (optionally filter by date)
// @access  Private/Doctor
router.get('/doctor', protect, authorizeRoles('doctor'), async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    let filter = { doctorId: doctorProfile._id };
    if (req.query.date) {
      filter.date = req.query.date;
    }
    const slots = await Availability.find(filter).sort({ date: 1, startTime: 1 });
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/availability/:id
// @desc    Delete an availability slot (doctor only, only if not booked)
// @access  Private/Doctor
router.delete('/:id', protect, authorizeRoles('doctor'), async (req, res) => {
  try {
    const slot = await Availability.findById(req.params.id).populate('doctorId');
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    if (!doctorProfile || doctorProfile._id.toString() !== slot.doctorId._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (slot.isBooked) {
      return res.status(400).json({ message: 'Cannot delete a booked slot' });
    }
    await slot.remove();
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/availability/service/:serviceId
// @desc    Get available slots for a service on a given date (patient only)
// @access  Private/Patient
// GET /api/availability/service/:serviceId
// Get upcoming slots for a service (patient only)
router.get('/service/:serviceId', protect, authorizeRoles('patient'), async (req, res) => {
  try {
    const AvailabilityModel = require('../models/Availability');
    const Service           = require('../models/Service');
    const Doctor            = require('../models/Doctor');

    const service = await Service.findById(req.params.serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const doctorProfile = await Doctor.findById(service.doctorId);
    if (!doctorProfile) return res.status(404).json({ message: 'Doctor profile not found' });

    // build filter: if ?date=YYYY-MM-DD use that, else all dates >= today
    let { date } = req.query;
    let filter = {
      doctorId: doctorProfile._id,
      isBooked: false
    };
    if (date) {
      filter.date = date;
    } else {
      const today = new Date().toISOString().split('T')[0];
      filter.date = { $gte: today };
    }

    const slots = await AvailabilityModel.find(filter)
      .sort({ date: 1, startTime: 1 })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' }
      });

    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
