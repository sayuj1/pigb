import defaultCategories from "@/data/defaultCategories";
import connectDB from "../../../lib/mongodb"; // Database connection
import Category from "../../../models/CategorySchema";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectDB(); // Connect to DB

    // Check if default categories already exist
    const existing = await Category.find({ isDefault: true });
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Default categories already exist." });
    }

    // Validate that all categories have a type
    const validTypes = ["income", "expense", "savings", "loans"];
    const invalid = defaultCategories.filter(
      (cat) => !cat.type || !validTypes.includes(cat.type)
    );
    if (invalid.length > 0) {
      return res.status(400).json({
        message: "Some default categories are missing a valid type.",
        invalidCategories: invalid,
      });
    }

    // Insert default categories
    await Category.insertMany(defaultCategories);
    res
      .status(201)
      .json({ message: "Default categories inserted successfully." });
  } catch (err) {
    console.error("Seeder error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
