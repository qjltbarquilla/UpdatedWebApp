const express = require("express");
const router = express.Router();
const Message = require("../models/Message"); // ✅ add this line

router.post("/send", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // ✅ create a new message and save to MongoDB
    const newMessage = new Message({ name, email, phone, subject, message });
    await newMessage.save();

    res.status(200).json({ message: "Message saved and sent successfully!" });
  } catch (error) {
    console.error("❌ Error while sending message:", error);
    res.status(500).json({ message: "Failed to save message" });
  }
});

module.exports = router;
