const express = require("express");
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const { authenticateUser, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Utility function to sanitize string inputs (prevent basic HTML/XSS injection)
 */
const sanitizeText = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>?/gm, "").trim();
};

// ============================================================
// 1. PUBLIC REVIEW ENDPOINTS
// ============================================================

/**
 * @route   GET /api/reviews/summary
 * @desc    Get aggregated rating score, review count, and star distribution for approved reviews
 * @access  Public
 */
router.get("/summary", async (req, res) => {
  try {
    const stats = await Review.aggregate([
      { $match: { status: "Approved" } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      }
    ]);

    let totalReviews = 0;
    let totalScore = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    stats.forEach((item) => {
      const star = item._id;
      const count = item.count;
      if (distribution[star] !== undefined) {
        distribution[star] = count;
      }
      totalReviews += count;
      totalScore += star * count;
    });

    const averageRating = totalReviews > 0 ? Number((totalScore / totalReviews).toFixed(1)) : 5.0;

    const percentages = {
      5: totalReviews > 0 ? Math.round((distribution[5] / totalReviews) * 100) : 0,
      4: totalReviews > 0 ? Math.round((distribution[4] / totalReviews) * 100) : 0,
      3: totalReviews > 0 ? Math.round((distribution[3] / totalReviews) * 100) : 0,
      2: totalReviews > 0 ? Math.round((distribution[2] / totalReviews) * 100) : 0,
      1: totalReviews > 0 ? Math.round((distribution[1] / totalReviews) * 100) : 0
    };

    res.json({
      success: true,
      summary: {
        averageRating,
        totalReviews,
        distribution,
        percentages
      }
    });
  } catch (error) {
    console.error("Review Summary Error:", error);
    res.status(500).json({ success: false, message: "Failed to load review summary." });
  }
});

/**
 * @route   GET /api/reviews/featured
 * @desc    Get up to 10 approved + featured reviews for homepage carousel
 * @access  Public
 */
router.get("/featured", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 10);

    const featuredReviews = await Review.find({
      status: "Approved",
      isFeatured: true
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("_id rating comment customerName pickup destination travelDate createdAt");

    res.json({
      success: true,
      count: featuredReviews.length,
      reviews: featuredReviews
    });
  } catch (error) {
    console.error("Featured Reviews Error:", error);
    res.status(500).json({ success: false, message: "Failed to load featured reviews." });
  }
});

// ============================================================
// 2. CUSTOMER REVIEW ENDPOINTS (PROTECTED)
// ============================================================

/**
 * @route   GET /api/reviews/eligible-bookings
 * @desc    Get customer's unreviewed bookings to choose from
 * @access  Private (Customer)
 */
router.get("/eligible-bookings", authenticateUser, async (req, res) => {
  try {
    if (req.user.role === "admin" && req.user._id === "admin") {
      return res.json({ success: true, eligibleBookings: [] });
    }

    // 1. Fetch customer's bookings
    const userBookings = await Booking.find({
      $or: [{ user: req.user._id }, { phone: req.user.phone }]
    }).sort({ createdAt: -1 });

    if (!userBookings.length) {
      return res.json({ success: true, eligibleBookings: [] });
    }

    // 2. Find booking IDs that have already been reviewed by this user
    const existingReviews = await Review.find({ user: req.user._id }).select("booking");
    const reviewedBookingIds = new Set(existingReviews.map((r) => r.booking.toString()));

    // 3. Filter only unreviewed bookings
    const eligibleBookings = userBookings
      .filter((b) => !reviewedBookingIds.has(b._id.toString()))
      .map((b) => ({
        _id: b._id,
        pickup: typeof b.pickup === "object" && b.pickup ? b.pickup.address : (b.pickup || "Pickup Location"),
        destination: b.destination,
        date: b.date || b.tdate,
        carType: b.carType || b.car || "Any",
        status: b.status
      }));

    res.json({
      success: true,
      eligibleBookings
    });
  } catch (error) {
    console.error("Eligible Bookings Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch eligible bookings." });
  }
});

/**
 * @route   POST /api/reviews
 * @desc    Submit a new customer review (linked to a verified booking)
 * @access  Private (Customer)
 */
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // 1. Validate rating
    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5 stars."
      });
    }

    // 2. Validate comment
    const sanitizedComment = sanitizeText(comment);
    if (!sanitizedComment || sanitizedComment.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Review comment must be at least 5 characters long."
      });
    }
    if (sanitizedComment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Review comment cannot exceed 1000 characters."
      });
    }

    // 3. Validate booking existence and ownership
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid booking to review."
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking record not found."
      });
    }

    // Verify booking belongs to authenticated customer
    const isOwner =
      (booking.user && booking.user.toString() === req.user._id.toString()) ||
      booking.phone === req.user.phone;

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only review your own trip bookings."
      });
    }

    // 4. Check for duplicate review on this booking
    const alreadyReviewed = await Review.findOne({ booking: booking._id });
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this trip."
      });
    }

    // 5. Persist review with verified trip details derived directly from database
    const newReview = await Review.create({
      user: req.user._id,
      booking: booking._id,
      rating: parsedRating,
      comment: sanitizedComment,
      customerName: req.user.name,
      pickup: typeof booking.pickup === "object" && booking.pickup ? booking.pickup.address : (booking.pickup || "Pickup Location"),
      destination: booking.destination,
      travelDate: booking.date || booking.tdate || new Date().toISOString().split("T")[0],
      status: "Pending",
      isFeatured: false
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your review has been submitted and is awaiting approval.",
      review: newReview
    });
  } catch (error) {
    console.error("Review Submission Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A review for this booking already exists."
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to submit review. Please try again."
    });
  }
});

/**
 * @route   GET /api/reviews/my
 * @desc    Get logged-in customer's submitted reviews
 * @access  Private (Customer)
 */
router.get("/my", authenticateUser, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("booking", "pickup destination date carType status");

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error("My Reviews Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch your reviews." });
  }
});

// ============================================================
// 3. ADMIN REVIEW MODERATION ENDPOINTS (ADMIN ONLY)
// ============================================================

/**
 * @route   GET /api/reviews/admin
 * @desc    Get all reviews with filtering and search for admin moderation
 * @access  Private (Admin)
 */
router.get("/admin", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { status, rating, search, sortBy } = req.query;
    const query = {};

    if (status && status !== "All") {
      if (status === "Featured") {
        query.isFeatured = true;
      } else {
        query.status = status;
      }
    }

    if (rating && rating !== "All") {
      query.rating = Number(rating);
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { customerName: searchRegex },
        { comment: searchRegex },
        { pickup: searchRegex },
        { destination: searchRegex }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === "oldest") sortOption = { createdAt: 1 };
    else if (sortBy === "ratingHigh") sortOption = { rating: -1 };
    else if (sortBy === "ratingLow") sortOption = { rating: 1 };

    const reviews = await Review.find(query).sort(sortOption);

    // Admin overview statistics
    const totalReviews = await Review.countDocuments();
    const approvedReviews = await Review.countDocuments({ status: "Approved" });
    const pendingReviews = await Review.countDocuments({ status: "Pending" });
    const rejectedReviews = await Review.countDocuments({ status: "Rejected" });
    const featuredReviews = await Review.countDocuments({ isFeatured: true });

    res.json({
      success: true,
      stats: {
        totalReviews,
        approvedReviews,
        pendingReviews,
        rejectedReviews,
        featuredReviews
      },
      reviews
    });
  } catch (error) {
    console.error("Admin Fetch Reviews Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch admin reviews." });
  }
});

/**
 * @route   PATCH /api/reviews/:id/status
 * @desc    Approve or reject a review
 * @access  Private (Admin)
 */
router.patch("/:id/status", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Approved", "Rejected"];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status. Allowed values: Pending, Approved, Rejected"
      });
    }

    const updateFields = { status };
    // If review is unapproved or rejected, automatically remove from featured display
    if (status !== "Approved") {
      updateFields.isFeatured = false;
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    res.json({
      success: true,
      message: `Review status updated to ${status}`,
      review: updatedReview
    });
  } catch (error) {
    console.error("Update Review Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update review status." });
  }
});

/**
 * @route   PATCH /api/reviews/:id/feature
 * @desc    Toggle featured status for an approved review
 * @access  Private (Admin)
 */
router.patch("/:id/feature", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { isFeatured } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    if (isFeatured && review.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved reviews can be marked as featured."
      });
    }

    review.isFeatured = Boolean(isFeatured);
    await review.save();

    res.json({
      success: true,
      message: `Review ${review.isFeatured ? "featured on homepage" : "removed from featured"}`,
      review
    });
  } catch (error) {
    console.error("Toggle Feature Review Error:", error);
    res.status(500).json({ success: false, message: "Failed to update featured status." });
  }
});

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review permanently
 * @access  Private (Admin)
 */
router.delete("/:id", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    res.json({
      success: true,
      message: "Review deleted successfully."
    });
  } catch (error) {
    console.error("Delete Review Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete review." });
  }
});

module.exports = router;
