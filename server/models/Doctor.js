// server/models/Doctor.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialty:     { type: String, required: true },
  bio:           String,
  experience:    String,
  qualifications:[String],
  profileImage:  String
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;

// ────────────────────────────────────────────────────────────────────────────────
// AUTO-SEED DOCTORS & PROFILES
// ────────────────────────────────────────────────────────────────────────────────
;(async () => {
  try {
    if (process.env.SEED_DOCTORS !== 'true') return;

    // only seed if no doctor profiles exist yet
    const existing = await Doctor.countDocuments();
    if (existing > 0) {
      console.log('⛔️  DoctorProfiles already seeded');
      return;
    }

    // default doctor definitions
    const defaults = [
      {
        name:          'Dr. Alice Heart',
        email:         'alice@cardio.com',
        password:      'AlicePass123',
        specialty:     'Cardiology',
        bio:           'Board‐certified cardiologist with 10 years of experience.',
        experience:    '10 years',
        qualifications:['MD','FACC'],
        profileImage:  'https://i.pravatar.cc/150?img=32'
      },
      {
        name:          'Dr. Bob Immuno',
        email:         'bob@immunology.com',
        password:      'BobPass123',
        specialty:     'Immunology',
        bio:           'Expert in immunizations and allergy management.',
        experience:    '8 years',
        qualifications:['MD','PhD'],
        profileImage:  'https://i.pravatar.cc/150?img=47'
      },
      {
        name:          'Dr. Carol Child',
        email:         'carol@pediatrics.com',
        password:      'CarolPass123',
        specialty:     'Pediatrics',
        bio:           'Pediatrician focused on family‐centered care.',
        experience:    '6 years',
        qualifications:['MD','FAAP'],
        profileImage:  'https://i.pravatar.cc/150?img=12'
      }
    ];

    const User = require('./User');

    let seeded = 0;
    for (let doc of defaults) {
      // 1) ensure user exists
      let user = await User.findOne({ email: doc.email });
      if (!user) {
        const hash = await bcrypt.hash(doc.password, 10);
        user = await User.create({
          name:     doc.name,
          email:    doc.email,
          password: hash,
          role:     'doctor'
        });
      }

      // 2) create the DoctorProfile
      await Doctor.create({
        userId:        user._id,
        specialty:     doc.specialty,
        bio:           doc.bio,
        experience:    doc.experience,
        qualifications:doc.qualifications,
        profileImage:  doc.profileImage
      });

      seeded++;
    }

    console.log(`✅  Seeded ${seeded} doctor profiles`);
  } catch (err) {
    console.error('❌  Error seeding doctors:', err);
  }
})();
