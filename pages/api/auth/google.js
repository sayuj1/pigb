import connectDB from "@/lib/mongodb";
import User from "@/models/UserSchema";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { serialize } from "cookie";
// import axios from "axios";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    try {

        const { tokenId } = req.body;

        if (!tokenId) {
            return res.status(400).json({ message: "Google token is required" });
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });
        // console.log("google user ", googleUser)

        const { email, name, picture, sub: googleId } = ticket.getPayload(); // sub is the Google ID


        await connectDB();

        // Check if user already exists
        let user = await User.findOne({ googleId });
        // console.log("user ", user, googleId)
        if (!user) {
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
            // Register new user if not found
            user = new User({
                googleId,
                email,
                name,
                profilePicture: picture,
                provider: "google",
                locale
            });
            await user.save();
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Set cookie
        res.setHeader("Set-Cookie", serialize("token", jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60,
            path: "/"
        }));

        res.status(200).json({ message: "Google Sign-In successful", user });
    } catch (error) {
        console.error("Google Sign-In error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
