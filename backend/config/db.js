const mongoose = require("mongoose");
const dns = require("dns");

// Configure DNS resolution for Windows Node.js environments connecting to MongoDB Atlas SRV
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (e) {
  // Ignore DNS config error if not supported in environment
}

/**
 * Connect to MongoDB Atlas cluster using Mongoose.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoURI) {
    console.error("❌ MongoDB connection error: MONGODB_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    // Attempt fallback DNS resolution if initial SRV query fails on Windows
    if (error.message.includes("querySrv")) {
      try {
        dns.setServers(["8.8.8.8", "8.8.4.4"]);
        const conn = await mongoose.connect(mongoURI);
        console.log(`✅ MongoDB Connected Successfully (via Fallback DNS): ${conn.connection.host}`);
        return;
      } catch (fallbackErr) {
        console.error(`❌ MongoDB Connection Error (Fallback DNS): ${fallbackErr.message}`);
        process.exit(1);
      }
    }
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
