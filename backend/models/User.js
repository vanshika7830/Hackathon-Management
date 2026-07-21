import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        // Common Fields (All Users)
        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        role: {
            type: String,
            enum: ["admin", "organizer", "participant", "judge"],
            default: "participant",
        },

        phone: {
            type: String,
            trim: true,
        },

        bio: {
            type: String,
            default: "",
            trim: true,
        },

        isBlocked: {
            type: Boolean,
            default: false,
        },

        // Participant Fields
        college: {
            type: String,
            trim: true,
        },

        course: {
            type: String,
            trim: true,
        },

        year: {
            type: Number,
            min: 1,
            max: 5,
        },

        skills: [
            {
                type: String,
                trim: true,
            },
        ],

        resumeUrl: {
            type: String,
        },

        // Common Professional Fields
        // (Organizer & Judge)
        designation: {
            type: String,
            trim: true,
        },

        experience: {
            type: Number,
            min: 0,
        },


        // Organizer Only Fields
        organization: {
            type: String,
            trim: true,
        },

        // Judge Only Fields
        company: {
            type: String,
            trim: true,
        },

        expertise: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("User", userSchema);