import connectDB from "@/lib/mongodb";
import UserProfile from "@/models/UserSchema";
import { authenticate } from "@/utils/backend/authMiddleware";

export default async function handler(req, res) {
    await connectDB();
    const userId = authenticate(req);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.method === "GET") {
        try {
            const user = await UserProfile.findById(userId).select("-password");
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json(user);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

    if (req.method === "PUT") {
        try {
            const { name, locale } = req.body;
            const updatedUser = await UserProfile.findByIdAndUpdate(
                userId,
                { $set: { name, locale } },
                { new: true, runValidators: true }
            ).select("-password");

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json(updatedUser);
        } catch (error) {
            console.error("Error updating user profile:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
