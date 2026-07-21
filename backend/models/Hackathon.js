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
                type: String,
                trim: true,
            },
        ],

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Hackathon", hackathonSchema);