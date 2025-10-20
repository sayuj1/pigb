import { ValidationError } from "@/utils/backend/error";
import connectDB from "../../../lib/mongodb";
import User from "../../../models/UserSchema";
import bcrypt from "bcryptjs";
import { getAllInfoByISO } from "iso-country-currency";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();

  try {
    const { name, email, password } = req.body;

    // Get locale details from ISO
    const localeInfo = getAllInfoByISO("IN");

    if (!localeInfo) {
      throw new ValidationError("Invalid country ISO code");
    }

    // Construct the locale object
    const locale = {
      iso: localeInfo.iso,
      currency: localeInfo.currency,
      symbol: localeInfo.symbol,
      countryName: localeInfo.countryName,
      dateFormat: localeInfo.dateFormat || "d/M/yyyy", // fallback
    };
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({ name, email, password: hashedPassword, locale });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
