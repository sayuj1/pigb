import connectDB from "@/lib/mongodb";
import User from "@/models/UserSchema";
import { authenticate } from "@/utils/backend/authMiddleware";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    await connectDB();
    const userId = authenticate(req);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is a Google user
        if (user.provider === "google") {
            return res.status(400).json({ message: "Google users cannot change password manually" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid current password" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
