import Submission from "../models/Submission.js";
import Team from "../models/Team.js";
import Hackathon from "../models/Hackathon.js";
import Registration from "../models/Registration.js";


export const createSubmission = async (req, res) => {
    try {
        const { teamId, hackathonId, ...submissionData } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only team leader can submit project" });
        }

        const registration = await Registration.findOne({
            team: teamId,
            hackathon: hackathonId,
            status: "approved",
        });
        if (!registration) {
            return res.status(400).json({ message: "Team registration not approved for this hackathon" });
        }

        const hackathon = await Hackathon.findById(hackathonId);
        if (new Date() > new Date(hackathon.endDate)) {
            return res.status(400).json({ message: "Submission deadline has passed" });
        }

        const existing = await Submission.findOne({ team: teamId, hackathon: hackathonId });
        if (existing) {
            return res.status(400).json({ message: "Team already submitted for this hackathon" });
        }

        const submission = await Submission.create({
            team: teamId,
            hackathon: hackathonId,
            ...submissionData,
        });

        res.status(201).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const updateSubmission = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id).populate("hackathon");
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        const team = await Team.findById(submission.team);
        if (team.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only team leader can edit submission" });
        }

        if (new Date() > new Date(submission.hackathon.endDate)) {
            return res.status(400).json({ message: "Cannot edit after deadline" });
        }

        const updated = await Submission.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate("team", "teamName members leader")
            .populate("hackathon", "title");
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }
        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getSubmissionsByHackathon = async (req, res) => {
    try {
        const submissions = await Submission.find({ hackathon: req.params.hackathonId })
            .populate("team", "teamName members");
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getMySubmission = async (req, res) => {
    try {
        const team = await Team.findOne({ members: req.user._id, hackathon: req.params.hackathonId });
        if (!team) {
            return res.status(404).json({ message: "No team found for this hackathon" });
        }

        const submission = await Submission.findOne({ team: team._id, hackathon: req.params.hackathonId });
        if (!submission) {
            return res.status(404).json({ message: "No submission yet" });
        }

        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};