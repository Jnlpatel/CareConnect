// server/models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dateOfBirth: Date,
  sex: String,
  gender: String,
  familyDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  insuranceInfo: String,
  bloodType: String,
  medicalNotes: String
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
