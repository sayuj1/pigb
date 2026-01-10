import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  category: { type: String, default: "General" },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

GoalSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  // Only auto-complete if not explicitly set to pending
  if (this.currentAmount >= this.targetAmount && this.status !== "pending") {
    this.status = "completed";
  }
  next();
});

export default mongoose.models.Goal || mongoose.model("Goal", GoalSchema);
