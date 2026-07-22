import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        submission: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Submission",
            required: true,
        },
        judge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        scores: [
            {
                criterion: { type: String, required: true },
                marksGiven: { type: Number, required: true, min: 0 },
            },
        ],
        totalScore: {
            type: Number,
            default: 0,
        },
        feedback: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

reviewSchema.index({ submission: 1, judge: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);