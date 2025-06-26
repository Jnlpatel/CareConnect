// server/routes/appointments.js
const express = require('express');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// @route   POST /api/appointments
// @desc    Book a new appointment (patient only)
// @access  Private/Patient
router.post('/', protect, authorizeRoles('patient'), async (req, res) => {
  try {
    const { serviceId, slotId } = req.body;
    if (!serviceId || !slotId) {
      return res.status(400).json({ message: 'serviceId and slotId are required' });
    }

    // 1. Find the availability slot
    const slot = await Availability.findById(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.isBooked) return res.status(400).json({ message: 'Slot is already booked' });

    // 2. Confirm doctor
    const doctorProfile = await Doctor.findById(slot.doctorId);
    if (!doctorProfile) return res.status(400).json({ message: 'Doctor profile not found' });

    // 3. Create appointment
    // Combine date + startTime into a JS Date
    const [hours, minutes] = slot.startTime.split(':');
    const dateOnly = new Date(slot.date);
    dateOnly.setHours(parseInt(hours), parseInt(minutes));
    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId: doctorProfile._id,
      serviceId,
      dateTime: dateOnly
    });

    // 4. Mark availability slot as booked
    slot.isBooked = true;
    slot.appointmentId = appointment._id;
    await slot.save();

    // 5. Create notifications
    const patientUser = await User.findById(req.user.id);
    await Notification.create({
      userId: patientUser._id,
      appointmentId: appointment._id,
      type: 'booked',
      message: `You booked an appointment on ${dateOnly.toLocaleString()}`
    });
    const doctorUser = await User.findById(doctorProfile.userId);
    await Notification.create({
      userId: doctorUser._id,
      appointmentId: appointment._id,
      type: 'booked',
      message: `New appointment by ${patientUser.name} on ${dateOnly.toLocaleString()}`
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/patient
// @desc    Get all appointments for current patient
// @access  Private/Patient
router.get('/patient', protect, authorizeRoles('patient'), async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' }
      })
      .populate('serviceId')
      .sort({ dateTime: 1 });
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel an appointment (patient only)
// @access  Private/Patient
router.put('/:id/cancel', protect, authorizeRoles('patient'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    appointment.status = 'canceled';
    await appointment.save();

    // Free up availability slot
    const slot = await Availability.findOne({ appointmentId: appointment._id });
    if (slot) {
      slot.isBooked = false;
      slot.appointmentId = null;
      await slot.save();
    }

    // Notification to patient
    await Notification.create({
      userId: req.user.id,
      appointmentId: appointment._id,
      type: 'canceled',
      message: `You canceled your appointment on ${appointment.dateTime.toLocaleString()}`
    });

    const doctorProfile = await Doctor.findById(appointment.doctorId);
    const doctorUser = await User.findById(doctorProfile.userId);
    await Notification.create({
      userId: doctorUser._id,
      appointmentId: appointment._id,
      type: 'canceled',
      message: `Appointment by patient was canceled for ${appointment.dateTime.toLocaleString()}`
    });

    res.json({ message: 'Appointment canceled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id/complete
// @desc    Mark appointment as completed (doctor only)
// @access  Private/Doctor
router.put('/:id/complete', protect, authorizeRoles('doctor'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Verify doctor owns this appointment
    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    if (!doctorProfile || doctorProfile._id.toString() !== appointment.doctorId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { notes } = req.body;
    appointment.status = 'completed';
    if (notes) appointment.notes = notes;
    await appointment.save();

    // Notification to patient
    await Notification.create({
      userId: appointment.patientId,
      appointmentId: appointment._id,
      type: 'completed',
      message: `Your appointment on ${appointment.dateTime.toLocaleString()} was marked completed`
    });

    res.json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/doctor
// @desc    Get all appointments for current doctor
// @access  Private/Doctor
router.get('/doctor', protect, authorizeRoles('doctor'), async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    const appointments = await Appointment.find({ doctorId: doctorProfile._id })
      .populate('patientId', 'name')
      .populate('serviceId', 'name')
      .sort({ dateTime: 1 });
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments
// @desc    Get all appointments (admin only)
// @access  Private/Admin
router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate('serviceId', 'name')
      .sort({ dateTime: 1 });
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment (admin only; e.g., change status)
// @access  Private/Admin
router.put('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const { status, dateTime } = req.body;
    if (status) appointment.status = status;
    if (dateTime) appointment.dateTime = new Date(dateTime);
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
