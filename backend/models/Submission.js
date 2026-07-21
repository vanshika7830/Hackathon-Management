import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },

        hackathon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hackathon",
            required: true,
        },

        projectName: {
            type: String,
            required: true,
            trim: true,
        },

        problemStatement: {
            type: String,
            required: true,
            trim: true,
        },

        solution: {
            type: String,
            required: true,
            trim: true,
        },

        githubRepo: {
            type: String,
            trim: true,
        },

        liveDemoUrl: {
            type: String,
            trim: true,
        },

        techStack: [
            {
                type: String,
                trim: true,
            },
        ],

        screenshots: [
            {
                type: String,
            },
        ],

        presentationPdf: {
            type: String,
        },

        demoVideoLink: {
            type: String,
        },

        status: {
            type: String,
            enum: ["Pending", "Under Review", "Approved", "Rejected"],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Submission", submissionSchema);