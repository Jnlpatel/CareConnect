// server/routes/users.js
const express = require('express');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { protect, authorizeRoles } = require('../middlewares/auth');
const bcrypt  = require('bcryptjs');               

const router = express.Router();

// @route   GET /api/users/me
// @desc    Get current user + profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ userId: user._id });
    }
    res.json({ user, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/me
// @desc    Update current user + profile
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;
    const updateUser = { name, phone, profileImage };
    await User.findByIdAndUpdate(req.user.id, updateUser);

    const user = await User.findById(req.user.id);
    if (user.role === 'patient') {
      const {
        dateOfBirth,
        sex,
        gender,
        familyDoctorId,
        insuranceInfo,
        bloodType,
        medicalNotes
      } = req.body;
      await Patient.findOneAndUpdate(
        { userId: user._id },
        { dateOfBirth, sex, gender, familyDoctorId, insuranceInfo, bloodType, medicalNotes }
      );
    } else if (user.role === 'doctor') {
      const { specialty, bio, experience, qualifications } = req.body;
      await Doctor.findOneAndUpdate(
        { userId: user._id },
        { specialty, bio, experience, qualifications, profileImage }
      );
    }
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------------------------------------------------
// ADMIN‐ONLY ROUTES
// ---------------------------------------------------------------

// @route   POST /api/users
// @desc    Create a new user (admin only)
// @access  Private/Admin
router.post('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, email, password, role, specialty } = req.body;
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: 'name, email, password & role are required' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // hash the password
    const hashed = await bcrypt.hash(password, 10);

    // create the user
    const user = await User.create({ name, email, password: hashed, role });

    // create the corresponding profile
    if (role === 'patient') {
      await Patient.create({ userId: user._id });
    } else if (role === 'doctor') {
      if (!specialty) {
        return res
          .status(400)
          .json({ message: 'specialty is required for doctor role' });
      }
      await Doctor.create({ userId: user._id, specialty });
    }

    const out = user.toObject();
    delete out.password;
    res.status(201).json(out);
  } catch (err) {
    console.error('POST /api/users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   GET /api/users
// @desc    List all users (admin only)
// @access  Private/Admin
router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json(users);
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// @route   PUT /api/users/:id
// @desc    Update any user (admin only)
// @access  Private/Admin
router.put('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, email, role, phone } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name)  user.name  = name;
    if (email) user.email = email;
    if (role)  user.role  = role;
    if (phone) user.phone = phone;

    await user.save();
    const out = user.toObject();
    delete out.password;
    res.json(out);
  } catch (err) {
    console.error('PUT /api/users/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete any user (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('DELETE /api/users/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
