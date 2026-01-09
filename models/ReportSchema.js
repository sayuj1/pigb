import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true }, // e.g., 2024
    versions: [
        {
            content: { type: String },
            status: {
                type: String,
                enum: ["generating", "completed", "failed"],
                default: "completed"
            },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    selectedVersionIndex: { type: Number, default: 0 },
}, {
    timestamps: true,
});

// Compound unique index to ensure one report document per user-month-year
ReportSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
