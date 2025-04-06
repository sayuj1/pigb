import connectDB from '../../../lib/mongodb';
import ShoppingList from "@/models/ShoppingListSchema";
import { authenticate } from "@/utils/backend/authMiddleware";

export default async function handler(req, res) {
    await connectDB();

    const userId = authenticate(req);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    switch (req.method) {
        case "POST":
            // 🆕 Create a New Shopping List
            try {
                const { name, items } = req.body;

                if (!name) {
                    return res.status(400).json({ message: "Shopping list name is required" });
                }

                const newShoppingList = new ShoppingList({
                    userId,
                    name,
                    items: items || [],
                });

                await newShoppingList.save();
                res.status(201).json({ message: "Shopping list created successfully", shoppingList: newShoppingList });
            } catch (error) {
                res.status(500).json({ message: "Server error", error: error.message });
            }
            break;

        case "GET":
            // 📄 Fetch All Shopping Lists (Pagination, Sorting, Searching)
            try {
                const { page = 1, limit = 10, search, sortBy = "createdAt", sortOrder = "desc" } = req.query;
                const query = { userId };

                // 🔍 Searching (by list name)
                if (search) {
                    query.name = { $regex: search, $options: "i" };
                }

                // 📊 Sorting
                const sortQuery = {};
                sortQuery[sortBy] = sortOrder === "desc" ? -1 : 1;

                // 📌 Pagination
                const shoppingLists = await ShoppingList.find(query)
                    .sort(sortQuery)
                    .skip((page - 1) * limit)
                    .limit(Number(limit));

                const totalLists = await ShoppingList.countDocuments(query);

                res.status(200).json({
                    shoppingLists,
                    pagination: {
                        totalPages: Math.ceil(totalLists / limit),
                        currentPage: Number(page),
                        totalLists,
                    },
                });
            } catch (error) {
                res.status(500).json({ message: "Server error", error: error.message });
            }
            break;

        case "PUT":
            // ✏️ Update a Shopping List (Edit Name, Add/Remove Items)
            try {
                const { id } = req.query;
                const { name, items } = req.body;

                const shoppingList = await ShoppingList.findOne({ _id: id, userId });
                if (!shoppingList) {
                    return res.status(404).json({ message: "Shopping list not found" });
                }

                if (name) shoppingList.name = name;
                if (items) shoppingList.items = items;

                await shoppingList.save();
                res.status(200).json({ message: "Shopping list updated successfully", shoppingList });
            } catch (error) {
                res.status(500).json({ message: "Server error", error: error.message });
            }
            break;

        case "DELETE":
            // 🗑️ Delete a Shopping List
            try {
                const { id } = req.query;
                const shoppingList = await ShoppingList.findOneAndDelete({ _id: id, userId });

                if (!shoppingList) {
                    return res.status(404).json({ message: "Shopping list not found" });
                }

                res.status(200).json({ message: "Shopping list deleted successfully" });
            } catch (error) {
                res.status(500).json({ message: "Server error", error: error.message });
            }
            break;
        default:
            res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
            res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}
