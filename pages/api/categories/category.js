import connectDB from "../../../lib/mongodb";
import Category from "../../../models/CategorySchema";

export default async function handler(req, res) {
  await connectDB(); // Ensure database is connected

  switch (req.method) {
    case "GET":
      return getCategories(req, res);
    case "POST":
      return createCategory(req, res);
    default:
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}

// 📌 GET: Fetch all categories (Default + User-defined)
const getCategories = async (req, res) => {
  try {
    const { userId, type } = req.query;

    let query = {
      $or: [
        { userId }, // User-defined
        { isDefault: true }, // Default
      ],
    };

    if (type) {
      query.$and = [{ type }];
    }

    const categories = await Category.find(query);

    res
      .status(200)
      .json({ message: "Categories fetched successfully.", categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📌 POST: Create a new category (User-defined)
const createCategory = async (req, res) => {
  try {
    const { name, icon, type, isDefault = false, userId } = req.body;

    // Validate required fields
    if (!name || !icon || !type) {
      return res.status(400).json({
        message: "Name, icon, and type are required.",
      });
    }

    // User ID must be provided for custom categories
    if (!isDefault && !userId) {
      return res.status(400).json({
        message: "User ID is required for user-defined categories.",
      });
    }

    // Construct category data
    const categoryData = {
      name,
      icon,
      type,
      isDefault,
    };

    if (!isDefault) {
      categoryData.userId = userId;
    }

    const category = new Category(categoryData);
    await category.save();

    res.status(201).json({
      message: "Category created successfully.",
      category,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
