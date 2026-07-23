import Submission from "../models/Submission.js";
import Review from "../models/Review.js";

export const getLeaderboard = async (req, res) => {
    try {
        const { hackathonId } = req.params;

        const submissions = await Submission.find({ hackathon: hackathonId })
            .populate("team", "teamName");

        const leaderboard = await Promise.all(
            submissions.map(async (submission) => {
                const reviews = await Review.find({ submission: submission._id });

                const totalScore = reviews.reduce((sum, r) => sum + r.totalScore, 0);
                const avgScore = reviews.length ? totalScore / reviews.length : 0;

                return {
                    teamName: submission.team.teamName,
                    projectName: submission.projectName,
                    totalScore: avgScore,
                    reviewCount: reviews.length,
                };
            })
        );

        leaderboard.sort((a, b) => b.totalScore - a.totalScore);

        const ranked = leaderboard.map((entry, index) => ({
            rank: index + 1,
            ...entry,
        }));

        res.status(200).json(ranked);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};