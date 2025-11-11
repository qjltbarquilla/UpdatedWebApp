// backend/routes/patientRoutes.js
const express = require("express");
const Patient = require("../models/Patient");

const router = express.Router();

// POST /api/patients/add
router.post("/add", async (req, res) => {
  try {
    console.log("📩 /api/patients/add body:", req.body);

    const { name, age, gender, ownerUsername } = req.body;

    if (!name || !age || !gender || !ownerUsername) {
      return res
        .status(400)
        .json({ message: "All fields are required, including ownerUsername." });
    }

    const newPatient = new Patient({
      name,
      age,
      gender,
      ownerUsername,
    });

    await newPatient.save();

    return res.status(201).json({
      message: "Patient added successfully.",
      patient: newPatient,
    });
  } catch (error) {
    console.error("❌ Error in /api/patients/add:", error);
    return res
      .status(500)
      .json({ message: "Server error while adding patient.", error: error.message });
  }
});

// ✅ GET /api/patients?ownerUsername=...
router.get("/", async (req, res) => {
  try {
    const { ownerUsername } = req.query;

    if (!ownerUsername) {
      return res
        .status(400)
        .json({ message: "ownerUsername is required." });
    }

    const patients = await Patient.find({ ownerUsername }).sort({
      createdAt: -1,
    });

    return res.json(patients);
  } catch (error) {
    console.error("❌ Error in GET /api/patients:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching patients." });
  }
});

// GET /api/patients/:id?ownerUsername=jey
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerUsername } = req.query;

    if (!ownerUsername) {
      return res.status(400).json({ message: "ownerUsername is required." });
    }

    const patient = await Patient.findOne({ _id: id, ownerUsername });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found or not yours." });
    }

    return res.json(patient);
  } catch (error) {
    console.error("❌ Error in GET /api/patients/:id:", error);
    res.status(500).json({ message: "Server error while fetching patient." });
  }
});

// PUT /api/patients/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, gender, ownerUsername } = req.body;

    if (!ownerUsername) {
      return res.status(400).json({ message: "ownerUsername is required." });
    }

    const updates = {};
    if (name) updates.name = name;
    if (typeof age !== "undefined") updates.age = age;
    if (gender) updates.gender = gender;

    const updated = await Patient.findOneAndUpdate(
      { _id: id, ownerUsername }, // only update your own patient
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Patient not found or not yours." });
    }

    return res.json({
      message: "Patient updated successfully.",
      patient: updated,
    });
  } catch (error) {
    console.error("❌ Error in PUT /api/patients/:id:", error);
    res.status(500).json({ message: "Server error while updating patient." });
  }
});

// DELETE /api/patients/:id?ownerUsername=jey
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerUsername } = req.query;

    const deleted = await Patient.findOneAndDelete({ _id: id, ownerUsername });

    if (!deleted) {
      return res.status(404).json({ message: "Patient not found or not yours." });
    }

    return res.json({ message: "Patient deleted successfully." });
  } catch (error) {
    console.error("❌ Error in DELETE /api/patients/:id:", error);
    res.status(500).json({ message: "Server error while deleting patient." });
  }
});



module.exports = router;
