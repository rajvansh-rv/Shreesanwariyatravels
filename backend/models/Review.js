const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to an authenticated user"]
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Review must be linked to a verified booking"],
      unique: true // Strict database level prevention of duplicate review on the same booking
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1 star"],
      max: [5, "Rating cannot exceed 5 stars"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number between 1 and 5"
      }
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [5, "Review comment must be at least 5 characters long"],
      maxlength: [1000, "Review comment cannot exceed 1000 characters"]
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true
    },
    pickup: {
      type: String,
      required: [true, "Pickup location is required"],
      trim: true
    },
    destination: {
      type: String,
      required: [true, "Destination location is required"],
      trim: true
    },
    travelDate: {
      type: String,
      required: [true, "Travel date is required"],
      trim: true
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast public querying and admin filtering
reviewSchema.index({ status: 1, isFeatured: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
