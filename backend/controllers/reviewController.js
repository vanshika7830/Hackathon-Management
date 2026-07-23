import Review from "../models/Review.js";
import Submission from "../models/Submission.js";
import Hackathon from "../models/Hackathon.js";

export const submitReview = async (req, res) => {
    try {
        const { submissionId, scores, feedback } = req.body;

        const submission = await Submission.findById(submissionId).populate("hackathon");
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        const hackathon = await Hackathon.findById(submission.hackathon._id);
        const isAssigned = hackathon.assignedJudges
            .map((id) => id.toString())
            .includes(req.user._id.toString());
        if (!isAssigned) {
            return res.status(403).json({ message: "You are not assigned to judge this hackathon" });
        }

        const existing = await Review.findOne({ submission: submissionId, judge: req.user._id });
        if (existing) {
            return res.status(400).json({ message: "You already reviewed this submission" });
        }

        const totalScore = scores.reduce((sum, s) => sum + s.marksGiven, 0);

        const review = await Review.create({
            submission: submissionId,
            judge: req.user._id,
            scores,
            totalScore,
            feedback,
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReviewsBySubmission = async (req, res) => {
    try {
        const reviews = await Review.find({ submission: req.params.submissionId })
            .populate("judge", "firstName lastName");
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getJudgeAssignments = async (req, res) => {
    try {
        const hackathons = await Hackathon.find({ assignedJudges: req.user._id });
        const hackathonIds = hackathons.map((h) => h._id);

        const submissions = await Submission.find({ hackathon: { $in: hackathonIds } })
            .populate("team", "teamName")
            .populate("hackathon", "title");

        const reviewedIds = (
            await Review.find({ judge: req.user._id }).select("submission")
        ).map((r) => r.submission.toString());

        const result = submissions.map((s) => ({
            ...s.toObject(),
            reviewed: reviewedIds.includes(s._id.toString()),
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};