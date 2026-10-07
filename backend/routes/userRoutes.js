const express = require("express");
const User = require("../models/User");
const Booking = require("../models/Booking");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   GET /api/users/me
 * @desc    Get customer profile
 * @access  Private (Customer & Admin)
 */
router.get("/me", authenticateUser, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * @route   PATCH /api/users/me
 * @desc    Update customer profile (Name & Phone)
 * @access  Private (Customer)
 */
router.patch("/me", authenticateUser, async (req, res) => {
  try {
    if (req.user.role === "admin" && req.user._id === "admin") {
      return res.status(400).json({ success: false, message: "Admin profile cannot be modified via user endpoint." });
    }

    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name.trim();
    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, "");
      if (!/^[0-9]{10}$/.test(cleanPhone)) {
        return res.status(400).json({ success: false, message: "Please enter a valid 10-digit mobile number." });
      }
      user.phone = cleanPhone;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
});

/**
 * @route   GET /api/users/me/bookings
 * @desc    Get logged-in customer's own booking history
 * @access  Private (Customer)
 */
router.get("/me/bookings", authenticateUser, async (req, res) => {
  try {
    // If admin is calling /me/bookings, return empty array or all bookings
    if (req.user.role === "admin" && req.user._id === "admin") {
      const allBookings = await Booking.find().sort({ createdAt: -1 });
      return res.json({ success: true, bookings: allBookings });
    }

    // Customer can only see bookings associated with their user ObjectId or matching their registered phone number
    const bookings = await Booking.find({
      $or: [
        { user: req.user._id },
        { phone: req.user.phone }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error("Customer Bookings Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch booking history." });
  }
});

module.exports = router;
