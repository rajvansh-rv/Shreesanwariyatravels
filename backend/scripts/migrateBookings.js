require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const fs = require("fs").promises;
const path = require("path");
const connectDB = require("../config/db");
const Booking = require("../models/Booking");

async function migrateBookings() {
  console.log("🚀 Starting migration from bookings.json to MongoDB Atlas...");

  await connectDB();

  const jsonFilePath = path.join(__dirname, "../bookings.json");

  try {
    const data = await fs.readFile(jsonFilePath, "utf-8");
    const jsonBookings = JSON.parse(data);

    if (!Array.isArray(jsonBookings) || jsonBookings.length === 0) {
      console.log("ℹ️ No bookings found in bookings.json to migrate.");
      process.exit(0);
    }

    console.log(`📦 Found ${jsonBookings.length} booking records in JSON file.`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const item of jsonBookings) {
      const name = (item.name || "").trim();
      const phone = String(item.phone || "").trim();
      const pickup = (item.pickup || "").trim();
      const destination = (item.destination || "").trim();
      const date = (item.date || item.tdate || "").trim();
      const carType = (item.car || item.cartype || item.carType || "Any / Suggest me").trim();
      const message = (item.request || item.message || "").trim();
      const status = item.status || "Pending";
      const createdAt = item.createdAt ? new Date(item.createdAt) : new Date();

      if (!name || !phone || !pickup || !destination || !date) {
        console.warn("⚠️ Skipping invalid booking record:", item);
        continue;
      }

      // Check if booking already exists in MongoDB to prevent duplication
      const existing = await Booking.findOne({
        name,
        phone,
        pickup,
        destination,
        date
      });

      if (existing) {
        skippedCount++;
        console.log(`⏩ Skipping duplicate booking for ${name} (${pickup} -> ${destination} on ${date})`);
      } else {
        await Booking.create({
          name,
          phone,
          pickup,
          destination,
          date,
          carType,
          message,
          status,
          createdAt
        });
        insertedCount++;
        console.log(`✅ Migrated booking for ${name} (${pickup} -> ${destination})`);
      }
    }

    console.log("\n==========================================");
    console.log(`🎉 Migration Completed Successfully!`);
    console.log(`Total Records: ${jsonBookings.length}`);
    console.log(`Inserted to MongoDB: ${insertedCount}`);
    console.log(`Skipped Duplicates: ${skippedCount}`);
    console.log("==========================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed with error:", error);
    process.exit(1);
  }
}

migrateBookings();
