import connectDB from "../../../lib/mongodb";
import User from "../../../models/UserSchema";
import { authenticate } from "@/utils/backend/authMiddleware";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findById(userId).select("-password"); 

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ user });
}
