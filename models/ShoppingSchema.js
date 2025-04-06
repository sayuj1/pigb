import mongoose from "mongoose";

const ShoppingItemSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the item (e.g., Milk, Bread)
  price: { type: Number, required: true, min: 0 }, // Price of the item
});

const ShoppingListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user
  name: { type: String, required: true }, // Shopping list name (e.g., "Weekly Groceries")
  items: [ShoppingItemSchema], // Array of shopping items
  totalCost: { type: Number, default: 0 }, // Total cost of items in the list
  createdAt: { type: Date, default: Date.now },
});

// 🔄 Automatically update `totalCost` before saving
ShoppingListSchema.pre("save", function (next) {
  this.totalCost = this.items.reduce((sum, item) => sum + item.price, 0);
  next();
});

const ShoppingList = mongoose.models.ShoppingList || mongoose.model("ShoppingList", ShoppingListSchema);
export default ShoppingList;
