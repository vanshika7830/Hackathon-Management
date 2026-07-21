import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
    {
        teamName: {
            type: String,
            required: true,
            trim: true,
        },

        hackathon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hackathon",
            required: true,
        },

        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Team", teamSchema);