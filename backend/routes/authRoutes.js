const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const RegisteredUser = require("../models/RegisteredUser");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username already exists
    const existingUser = await RegisteredUser.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Create a new user
    const newUser = new RegisteredUser({ username, password });
    await newUser.save();

    console.log("🧑 New user registered:", username);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    if (!res.headersSent) {  // Ensure headers are not sent twice
      res.status(500).json({ message: "Error registering user", error });
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await RegisteredUser.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password match
    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    console.log("✅ Login successful for user:", username);

    // Optionally, generate a JWT token
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    // Send response with JWT token and username
    if (!res.headersSent) {  // Ensure headers are not sent twice
      res.status(200).json({ message: "Login successful", token, username });
    }
  } catch (error) {
    console.error("❌ Error logging in:", error);
    if (!res.headersSent) {  // Ensure headers are not sent twice
      res.status(500).json({ message: "Error logging in" });
    }
  }
});

module.exports = router;
