const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true
    },
    pickup: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Pickup location is required"]
    },
    destination: {
      type: String,
      required: [true, "Destination location is required"],
      trim: true
    },
    date: {
      type: String,
      required: [true, "Travel date is required"],
      trim: true
    },
    carType: {
      type: String,
      default: "Any / Suggest me",
      trim: true
    },
    message: {
      type: String,
      default: "",
      trim: true
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending"
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property aliases for backward compatibility with existing frontend/legacy data
bookingSchema.virtual("car").get(function () {
  return this.carType;
});

bookingSchema.virtual("cartype").get(function () {
  return this.carType;
});

bookingSchema.virtual("request").get(function () {
  return this.message;
});

bookingSchema.virtual("tdate").get(function () {
  return this.date;
});

bookingSchema.virtual("pickupAddress").get(function () {
  if (this.pickup && typeof this.pickup === "object") {
    return this.pickup.address || "";
  }
  return this.pickup || "";
});

// Pre-init hook for backward compatibility: if pickup is a legacy string, normalize to object
bookingSchema.pre("init", function (doc) {
  if (doc && typeof doc.pickup === "string") {
    doc.pickup = {
      address: doc.pickup,
      latitude: null,
      longitude: null
    };
  }
});

// Pre-save hook: ensure structured format
bookingSchema.pre("save", function () {
  if (typeof this.pickup === "string") {
    this.pickup = {
      address: this.pickup.trim(),
      latitude: null,
      longitude: null
    };
  } else if (this.pickup && typeof this.pickup === "object") {
    this.pickup = {
      address: (this.pickup.address || "").trim(),
      latitude:
        this.pickup.latitude !== undefined && this.pickup.latitude !== null && this.pickup.latitude !== ""
          ? Number(this.pickup.latitude)
          : null,
      longitude:
        this.pickup.longitude !== undefined && this.pickup.longitude !== null && this.pickup.longitude !== ""
          ? Number(this.pickup.longitude)
          : null
    };
  }
});

// Create indexes for efficient filtering and searching
bookingSchema.index({ phone: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
