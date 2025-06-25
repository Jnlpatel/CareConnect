// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
  phone: String,
  profileImage: String
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

// ────────────────────────────────────────────────────────────────────────────────
// AUTO–SEED ADMIN
// This IIFE will run as soon as this file is `require`d, but only if
//   a) you set SEED_ADMIN=true in your .env, and
//   b) no user with that ADMIN_EMAIL already exists.
//────────────────────────────────────────────────────────────────────────────────
;(async () => {
  try {
    // only run if explicitly requested
    if (process.env.SEED_ADMIN !== 'true') return;

    const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@careconnect.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    // check for existing admin
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('👤  Admin already exists:', adminEmail);
      return;
    }

    // hash & create
    const hash = await bcrypt.hash(adminPassword, 10);
    const admin = await User.create({
      name:     'Super Admin',
      email:    adminEmail,
      password: hash,
      role:     'admin'
    });

    console.log('✅  Seeded admin:', adminEmail);
  } catch (err) {
    console.error('❌  Error seeding admin:', err);
  }
})();

module.exports = User;
