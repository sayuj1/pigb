import mongoose from "mongoose";

const GoalTransactionSchema = new mongoose.Schema({
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    description: { type: String, default: "Contribution to goal" },
    date: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.GoalTransaction || mongoose.model("GoalTransaction", GoalTransactionSchema);
