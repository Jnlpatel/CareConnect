// server/routes/services.js
const express = require('express');
const Service = require('../models/Service');
const Doctor = require('../models/Doctor');
const { protect, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// @route   POST /api/services
// @desc    Create a new service (doctor only)
// @access  Private/Doctor
router.post('/', protect, authorizeRoles('doctor','admin'), async (req, res) => {
  try {
    const { name, description, duration, price } = req.body;
    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    if (!doctorProfile) return res.status(400).json({ message: 'Doctor profile not found' });

    const newService = await Service.create({
      doctorId: doctorProfile._id,
      name,
      description,
      duration,
      price
    });
    res.status(201).json(newService);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/services
// @desc    Get all services (patient browsing)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    const services = await Service.find(filter)
      .populate({
        path: 'doctorId',
        select: 'userId specialty',
        populate: { path: 'userId', select: 'name' }
      });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/services/doctor
// @desc    Get all services for current doctor
// @access  Private/Doctor
router.get('/doctor', protect, authorizeRoles('doctor','admin'), async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    const services = await Service.find({ doctorId: doctorProfile._id });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/services/:id
// @desc    Update a service (doctor only)
// @access  Private/Doctor
router.put('/:id', protect, authorizeRoles('doctor','admin'), async (req, res) => {
  try {
    const { name, description, duration, price, doctorId } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // doctors only edit their own
    if (req.user.role !== 'admin') {
      const doc = await Doctor.findOne({ userId: req.user.id });
      if (!doc || doc._id.toString() !== service.doctorId.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } else {
      // admins may reassign doctor
      if (doctorId) service.doctorId = doctorId;
    }

    // now update fields
    if (name)        service.name        = name;
    if (description) service.description = description;
    if (duration)    service.duration    = duration;
    if (price)       service.price       = price;

    const updated = await service.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/services/:id
// Private/Doctor or Admin
router.delete('/:id', protect, authorizeRoles('doctor','admin'), async (req, res) => {
  try {
    const serviceId = req.params.id;

    // ADMIN: can delete any service outright
    if (req.user.role === 'admin') {
      const deleted = await Service.findByIdAndDelete(serviceId);
      if (!deleted) return res.status(404).json({ message: 'Service not found' });
      return res.json({ message: 'Service deleted' });
    }

    // DOCTOR: only delete their own services
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    if (!doctorProfile || doctorProfile._id.toString() !== service.doctorId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await service.remove();
    res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error('Error in DELETE /api/services/:id:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
