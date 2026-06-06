const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MongoDB connection failed ❌");
      console.error("MONGO_URI is missing in .env file");
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully ✅");
    console.log(`Database host: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection failed ❌");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;