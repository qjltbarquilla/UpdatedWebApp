// backend/models/Patient.js
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true },
    age:    { type: Number, required: true },
    gender: { type: String, required: true },
    ownerUsername: { type: String, required: true },
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
