import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
    {
        participant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        hackathon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hackathon",
            required: true,
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Registration", registrationSchema);