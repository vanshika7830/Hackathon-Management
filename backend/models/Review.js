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

        scores: {
            innovation: {
                type: Number,
                required: true,
                min: 0,
                max: 10,
            },

            technicalComplexity: {
                type: Number,
                required: true,
                min: 0,
                max: 10,
            },

            ui: {
                type: Number,
                required: true,
                min: 0,
                max: 10,
            },

            functionality: {
                type: Number,
                required: true,
                min: 0,
                max: 10,
            },

            scalability: {
                type: Number,
                required: true,
                min: 0,
                max: 10,
            },

            documentation: {
                type: Number,
                required: true,
                min: 0,
                max: 10,
            },

            presentation: {
                type: Number,
                required: true,
                min: 0,
                max: 10,
            },
        },

        totalScore: {
            type: Number,
            required: true,
            min: 0,
        },

        feedback: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Review", reviewSchema);