import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
    },
    isDefault: { type: Boolean, default: false },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return !this.isDefault; // Only required for user-defined categories
      },
    },
    icon: { type: String, required: false }, // Emoji/icon for the category
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Ensure unique category names within the same level (default or user-defined), scoped by type
CategorySchema.index(
  { name: 1, type: 1, isDefault: 1, userId: 1 },
  { unique: true }
);

// Middleware to prevent duplication of default categories
CategorySchema.pre("save", async function (next) {
  if (this.isDefault) {
    const existingCategory = await mongoose.models.Category.findOne({
      name: this.name,
      type: this.type,
      isDefault: true,
      userId: this.userId || null,
    });

    if (existingCategory) {
      const error = new Error(
        `The default category "${this.name}" of type "${this.type}" already exists.`
      );
      return next(error);
    }
  }
  next();
});

export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);
