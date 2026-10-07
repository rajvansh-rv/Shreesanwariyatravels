const express = require("express");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { authenticateUser, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply admin authentication to all admin routes
router.use(authenticateUser, requireAdmin);

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard summary statistics
 * @access  Admin
 */
router.get("/stats", async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "Pending" });
    const confirmedBookings = await Booking.countDocuments({ status: "Confirmed" });
    const completedBookings = await Booking.countDocuments({ status: "Completed" });
    const cancelledBookings = await Booking.countDocuments({ status: "Cancelled" });
    const totalCustomers = await User.countDocuments({ role: "customer" });

    res.json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalCustomers
      }
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard statistics." });
  }
});

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all bookings with backend search, filter, and sort
 * @access  Admin
 */
router.get("/bookings", async (req, res) => {
  try {
    const { search, status, dateFilter, sortBy } = req.query;

    const query = {};

    // 1. Status Filter
    if (status && status !== "All") {
      query.status = status;
    }

    // 2. Search Filter (Name, Phone, Pickup, Destination, Message)
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { "pickup.address": searchRegex },
        { pickup: searchRegex },
        { destination: searchRegex },
        { carType: searchRegex },
        { message: searchRegex }
      ];
    }

    // 3. Date Filter (Today, Upcoming, Past)
    const todayStr = new Date().toISOString().split("T")[0];
    if (dateFilter === "Today") {
      query.date = todayStr;
    } else if (dateFilter === "Upcoming") {
      query.date = { $gte: todayStr };
    } else if (dateFilter === "Past") {
      query.date = { $lt: todayStr };
    }

    // 4. Sorting Options
    let sortOptions = { createdAt: -1 }; // Default Newest
    if (sortBy === "oldest") {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === "travelDateAsc") {
      sortOptions = { date: 1 };
    } else if (sortBy === "travelDateDesc") {
      sortOptions = { date: -1 };
    } else if (sortBy === "name") {
      sortOptions = { name: 1 };
    } else if (sortBy === "status") {
      sortOptions = { status: 1 };
    }

    const bookings = await Booking.find(query).sort(sortOptions);

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error("Admin Fetch Bookings Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bookings." });
  }
});

/**
 * @route   PATCH /api/admin/bookings/:id/status
 * @desc    Update booking status (Pending, Confirmed, Completed, Cancelled)
 * @access  Admin
 */
router.patch("/bookings/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Allowed: Pending, Confirmed, Completed, Cancelled"
      });
    }

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking: updated
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update booking status." });
  }
});

/**
 * @route   DELETE /api/admin/bookings/:id
 * @desc    Delete booking permanently
 * @access  Admin
 */
router.delete("/bookings/:id", async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    res.json({
      success: true,
      message: "Booking deleted successfully."
    });
  } catch (error) {
    console.error("Delete Booking Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete booking." });
  }
});

/**
 * @route   GET /api/admin/export
 * @desc    Export bookings to CSV
 * @access  Admin
 */
router.get("/export", async (req, res) => {
  try {
    const { search, status, dateFilter } = req.query;

    const query = {};
    if (status && status !== "All") query.status = status;
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { pickup: searchRegex },
        { destination: searchRegex }
      ];
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (dateFilter === "Today") query.date = todayStr;
    else if (dateFilter === "Upcoming") query.date = { $gte: todayStr };
    else if (dateFilter === "Past") query.date = { $lt: todayStr };

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    // Build CSV Headers and Content
    let csv = "ID,Name,Phone,Pickup,Destination,Travel Date,Vehicle,Status,Special Requests,Created At\n";

    bookings.forEach((b) => {
      const id = b._id;
      const name = `"${(b.name || "").replace(/"/g, '""')}"`;
      const phone = `"${(b.phone || "").replace(/"/g, '""')}"`;
      const pickupAddr = typeof b.pickup === "object" && b.pickup ? b.pickup.address : (b.pickup || "");
      const pickupCoords =
        typeof b.pickup === "object" && b.pickup?.latitude && b.pickup?.longitude
          ? ` [${b.pickup.latitude}, ${b.pickup.longitude}]`
          : "";
      const pickup = `"${(pickupAddr + pickupCoords).replace(/"/g, '""')}"`;
      const dest = `"${(b.destination || "").replace(/"/g, '""')}"`;
      const date = `"${b.date || b.tdate || ""}"`;
      const vehicle = `"${(b.carType || b.car || "").replace(/"/g, '""')}"`;
      const statusVal = `"${b.status || "Pending"}"`;
      const reqVal = `"${(b.message || b.request || "").replace(/"/g, '""')}"`;
      const createdAt = `"${b.createdAt ? new Date(b.createdAt).toISOString() : ""}"`;

      csv += `${id},${name},${phone},${pickup},${dest},${date},${vehicle},${statusVal},${reqVal},${createdAt}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=bookings_export.csv");
    res.status(200).send(csv);
  } catch (error) {
    console.error("CSV Export Error:", error);
    res.status(500).json({ success: false, message: "Export failed." });
  }
});

module.exports = router;
