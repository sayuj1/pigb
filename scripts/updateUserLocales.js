import dotenv from "dotenv";
import mongoose from "mongoose";
import UserSchema from "../models/UserSchema.js";
import { getAllInfoByISO } from "iso-country-currency";
import connectDB from "../lib/mongodb.js";

async function updateUserLocales() {
    // Load variables from .env.local first, then fallback to .env
    dotenv.config({ path: ".env.local" });
    dotenv.config();

    const MONGO_URI = process.env.MONGODB_URI;

    try {

        await connectDB(MONGO_URI); // Connect to DB

        // Get locale info for India
        const localeInfo = getAllInfoByISO("IN");

        const locale = {
            iso: localeInfo.iso,
            currency: localeInfo.currency,
            symbol: localeInfo.symbol,
            countryName: localeInfo.countryName,
            dateFormat: localeInfo.dateFormat || "d/M/yyyy",
        };

        // Find users without locale or missing locale fields
        const usersWithoutLocale = await UserSchema.find({
            $or: [
                { locale: { $exists: false } },
                { "locale.iso": { $exists: false } },
                { "locale.currency": { $exists: false } },
            ],
        });

        console.log(`Found ${usersWithoutLocale.length} users without locale.`);

        // Bulk update
        const updateOps = usersWithoutLocale.map((user) => ({
            updateOne: {
                filter: { _id: user._id },
                update: { $set: { locale } },
            },
        }));

        if (updateOps.length > 0) {
            await UserSchema.bulkWrite(updateOps);
            console.log(`✅ Updated ${updateOps.length} users with default IN locale.`);
        } else {
            console.log("🎉 All users already have locale set.");
        }

        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    } catch (error) {
        console.error("❌ Error updating user locales:", error);
        process.exit(1);
    }
}

// updateUserLocales();
