import mongoose from "mongoose";

// MongoDB connection URI (update this with your MongoDB connection string)
const mongoURI = process.env.MONGODB_URI;

// Flag to check if the database is already connected
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("MongoDB already connected");
    return;
  }

  try {
    await mongoose.connect(mongoURI);

    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
