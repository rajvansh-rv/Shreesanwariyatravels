require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const Booking = require("./models/Booking");
const { validateBooking } = require("./utils/validation");
const { authenticateUser, requireAdmin, verifyAdminToken } = require("./middleware/authMiddleware");
const { verifyMailer, sendBookingNotificationEmail } = require("./utils/mailer");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(cors());

// ✅ CONNECT TO MONGODB ATLAS
connectDB();

// ✅ VERIFY EMAIL SMTP CONFIGURATION (Non-blocking)
verifyMailer();

// ✅ MOUNT ROUTERS
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);

// ✅ PUBLIC BOOKING CREATION (MONGODB ATLAS)
app.post("/api/bookings", async (req, res) => {
  const {
    name,
    phone,
    pickup,
    destination,
    tdate,
    date,
    cartype,
    carType,
    message,
    request,
    userId
  } = req.body;

  // Normalize incoming fields
  const travelDate = tdate || date;
  const selectedCar = cartype || carType || "Any / Suggest me";
  const userNote = message || request || "";

  // Validate booking data using current validation rules
  const validation = validateBooking({
    name,
    phone,
    pickup,
    destination,
    tdate: travelDate,
    cartype: selectedCar
  });

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message
    });
  }

  try {
    // Determine authenticated user ID if token provided in Authorization header
    let authenticatedUserId = userId || null;
    if (!authenticatedUserId && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const jwt = require("jsonwebtoken");
        const jwtSecret = process.env.JWT_SECRET || "sanwariya_travels_jwt_secret_key_2026_secure";
        const decoded = jwt.verify(token, jwtSecret);
        if (decoded && decoded.id && decoded.id !== "admin") {
          authenticatedUserId = decoded.id;
        }
      } catch (err) {
        // Token verification fail for guest booking is harmless
      }
    }

    // Normalize structured pickup object
    let normalizedPickup = {
      address: "",
      latitude: null,
      longitude: null
    };

    if (typeof pickup === "string") {
      normalizedPickup.address = pickup.trim();
    } else if (pickup && typeof pickup === "object") {
      normalizedPickup.address = (pickup.address || "").trim();
      normalizedPickup.latitude =
        pickup.latitude !== undefined && pickup.latitude !== null && pickup.latitude !== ""
          ? Number(pickup.latitude)
          : null;
      normalizedPickup.longitude =
        pickup.longitude !== undefined && pickup.longitude !== null && pickup.longitude !== ""
          ? Number(pickup.longitude)
          : null;
    }

    // Create new booking document in MongoDB Atlas
    const newBooking = await Booking.create({
      user: authenticatedUserId,
      name: name.trim(),
      phone: String(phone).trim(),
      pickup: normalizedPickup,
      destination: destination.trim(),
      date: travelDate,
      carType: selectedCar.trim(),
      message: userNote.trim(),
      status: "Pending"
    });

    // Send HTTP success response to client immediately (database booking creation is successful)
    res.status(201).json({
      success: true,
      message: "Booking submitted successfully.",
      bookingId: newBooking._id
    });

    // Send formatted HTML + Text email notification in the background
    sendBookingNotificationEmail(newBooking).catch((emailErr) => {
      console.error("[EMAIL] Unhandled background email dispatch error:", emailErr.message);
    });
  } catch (error) {
    console.error("MongoDB Booking Creation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Booking could not be saved. Please try again."
    });
  }
});

// ✅ GET ALL BOOKINGS (MONGODB ATLAS - LEGACY ADMIN ROUTE)
app.get("/api/bookings", verifyAdminToken, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// ✅ DELETE BOOKING (MONGODB ATLAS - LEGACY ADMIN ROUTE)
app.delete("/api/bookings/:id", verifyAdminToken, async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete Booking Error:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// ✅ EMAIL DIAGNOSTIC ROUTE (Safe - no secrets returned)
app.get("/api/health/email", async (req, res) => {
  const result = await verifyMailer();
  res.json({
    success: true,
    emailConfigured: result.configured,
    smtpReady: result.connected,
    senderEmail: result.user || "Not configured",
    recipientEmail: result.adminEmail || "Not configured",
    error: result.error || null
  });
});

// ✅ HEALTH CHECK ROUTE
app.get("/", (req, res) => {
  res.send("Server is running with MongoDB Atlas ✅");
});

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});