const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_db');
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection FAILED:', err.message);
    console.error('→ Make sure MongoDB is running: mongod');
    console.error('→ Or set MONGO_URI in server/.env');
    process.exit(1);
  }
};

module.exports = connectDB;
