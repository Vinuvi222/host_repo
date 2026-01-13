import express from "express";
import Driver from "../models/driver.model.js";  
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find driver by email
    const driver = await Driver.findOne({ email });
    if (!driver)
      return res.status(400).json({ message: "Invalid email or password" });

    // Compare password
    const isMatch = await driver.comparePassword(password); // <- this works now
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Generate token
    const token = jwt.sign(
      { id: driver._id, email: driver.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, driverId: driver._id, email: driver.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;


