const mongoose = require("mongoose");
const config = require("./index");

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
