import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../lib/mongodb.js";
import SavingsSchema from "../models/SavingsSchema.js";


dotenv.config({ path: ".env.local" });
dotenv.config();
const MONGO_URI = process.env.MONGODB_URI;

await connectDB(MONGO_URI);

await SavingsSchema.updateMany(
    { status: { $exists: false } },
    { $set: { status: "active", closedAt: null } }
);

console.log("✅ Updated all old savings with default status and closedAt");
process.exit(0);
