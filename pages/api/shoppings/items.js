import connectDB from "../../../lib/mongodb";
import ShoppingList from "@/models/ShoppingSchema";
import { authenticate } from "@/utils/backend/authMiddleware";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "POST":
      try {
        const { id } = req.query; // Shopping List ID
        const { name, price } = req.body;

        const shoppingList = await ShoppingList.findOne({ _id: id, userId });
        if (!shoppingList) {
          return res.status(404).json({ message: "Shopping list not found" });
        }

        shoppingList.items.unshift({ name, price }); // Insert at the beginning
        await shoppingList.save();

        res
          .status(200)
          .json({ message: "Item added successfully", shoppingList });
      } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;
    case "PUT":
      try {
        const { id, itemId } = req.query; // Shopping List ID and Item ID
        const { name, price } = req.body;

        const shoppingList = await ShoppingList.findOne({ _id: id, userId });
        if (!shoppingList) {
          return res.status(404).json({ message: "Shopping list not found" });
        }

        const item = shoppingList.items.id(itemId);
        if (!item) {
          return res.status(404).json({ message: "Item not found" });
        }

        if (name) item.name = name;
        if (price) item.price = price;

        await shoppingList.save();
        res
          .status(200)
          .json({ message: "Item updated successfully", shoppingList });
      } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;
    case "DELETE":
      try {
        const { id, itemId } = req.query; // Shopping List ID and Item ID

        const shoppingList = await ShoppingList.findOne({ _id: id, userId });
        if (!shoppingList) {
          return res.status(404).json({ message: "Shopping list not found" });
        }

        shoppingList.items = shoppingList.items.filter(
          (item) => item._id.toString() !== itemId
        );
        await shoppingList.save();

        res
          .status(200)
          .json({ message: "Item removed successfully", shoppingList });
      } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
