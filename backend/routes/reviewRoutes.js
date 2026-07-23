import express from "express";
import {
    submitReview,
    getReviewsBySubmission,
    getJudgeAssignments,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("judge"), submitReview);
router.get("/submission/:submissionId", protect, getReviewsBySubmission);
router.get("/my-assignments", protect, authorizeRoles("judge"), getJudgeAssignments);

export default router;