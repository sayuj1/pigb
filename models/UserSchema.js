import mongoose from "mongoose";
import Account from "./AccountSchema.js";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Required for manual authentication
  googleId: { type: String, unique: true, sparse: true }, // For Google authentication
  profilePicture: {
    type: String,
  },
  provider: { type: String, enum: ["manual", "google"], default: "manual" }, // Tracks how the user signed up
  locale: {
    iso: { type: String, default: "IN" }, // Country ISO code
    currency: { type: String, default: "INR" }, // Currency code
    symbol: { type: String, default: "₹" }, // Currency symbol
    countryName: { type: String, default: "India" }, // Country name
    dateFormat: { type: String, default: "d/M/yyyy" }, // Date display format
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
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