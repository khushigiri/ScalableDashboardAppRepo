const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connecting to Mongo...");
  } catch (error) {
    process.exit(1);
  }
};

module.exports = connectDB;


