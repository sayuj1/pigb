import mongoose from "mongoose";
import Account from "@/models/AccountSchema";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Required for manual authentication
  googleId: { type: String, unique: true, sparse: true }, // For Google authentication
  profilePicture: { 
    type: String, 
    default: "https://www.example.com/default-profile.png" // Default profile picture URL
  },
  provider: { type: String, enum: ["manual", "google"], default: "manual" }, // Tracks how the user signed up
  createdAt: { type: Date, default: Date.now },
});

// After a new user is created, automatically create a "Cash" account
UserSchema.post("save", async function (doc, next) {
  try {
    await Account.create({
      userId: doc._id,
      name: "Cash",
      type: "Cash",
      balance: 0,
      icon: "PiMoneyWavyDuotone",
      color: "#8BC34A"
    });
    next();
  } catch (error) {
    console.error("Error creating default Cash account:", error);
    next(error);
  }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);