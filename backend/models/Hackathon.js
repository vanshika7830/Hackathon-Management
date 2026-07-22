import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        theme: {
            type: String,
            required: true,
            trim: true,
        },

        mode: {
            type: String,
            enum: ["Online", "Offline"],
            required: true,
        },

        venue: {
            type: String,
            trim: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        registrationDeadline: {
            type: Date,
            required: true,
        },

        bannerImage: {
            type: String,
        },

        prizePool: {
            type: Number,
            default: 0,
            min: 0,
        },

        maxTeamSize: {
            type: Number,
            required: true,
            min: 1,
        },

        rules: [
            {
                type: String,
                trim: true,
            },
        ],

        judgingCriteria: [
            {
                criterion: { type: String, trim: true },
                maxMarks: { type: Number, default: 10 },
            },
        ],

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["upcoming", "ongoing", "completed"],
            default: "upcoming",
        },
        isRegistrationOpen: {
            type: Boolean,
            default: true,
            required: true,
        },
        assignedJudges:
            [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                }
            ]
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Hackathon", hackathonSchema);