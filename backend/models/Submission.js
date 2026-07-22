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
            required: true,
        },

        liveDemoUrl: {
            type: String,
            trim: true,
            required: true,
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
        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);
submissionSchema.index({ team: 1, hackathon: 1 }, { unique: true });
export default mongoose.model("Submission", submissionSchema);