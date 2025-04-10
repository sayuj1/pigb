import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "../../../lib/mongodb";
import Category from "../../../models/CategorySchema";

export default async function handler(req, res) {
  await connectDB(); // Ensure database is connected

  switch (req.method) {
    case "GET":
      return getCategories(req, res);
    case "POST":
      return createCategory(req, res);
    case "DELETE":
      return deleteCategory(req, res);
    default:
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}

const getCategories = async (req, res) => {
  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const {
      type,
      search,
      sortBy = "name",
      sortOrder = "asc",
      onlyUserCreated,
    } = req.query;

    let query =
      onlyUserCreated === "true"
        ? { userId }
        : {
            $or: [{ isDefault: true }, { userId }],
          };

    if (type) {
      query = { ...query, type };
    }

    if (search) {
      query = {
        ...query,
        name: { $regex: search, $options: "i" },
      };
    }

    const sort = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const categories = await Category.find(query).sort(sort);

    res
      .status(200)
      .json({ message: "Categories fetched successfully", categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📌 POST: Create a new category (User-defined)
const createCategory = async (req, res) => {
  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { name, icon, type, isDefault = false } = req.body;

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

const deleteCategory = async (req, res) => {
  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { id } = req.query;

    if (!id || !userId) {
      return res
        .status(400)
        .json({ message: "Category ID and user ID are required." });
    }

    const category = await Category.findOne({ _id: id });

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    if (category.isDefault) {
      return res
        .status(403)
        .json({ message: "Default categories cannot be deleted." });
    }

    if (category.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this category." });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({ message: "Category deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
