import express from "express";
import {
    createSubmission,
    updateSubmission,
    getSubmissionById,
    getSubmissionsByHackathon,
    getMySubmission,
} from "../controllers/submissionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("participant"), createSubmission);
router.put("/:id", protect, authorizeRoles("participant"), updateSubmission);
router.get("/:id", protect, getSubmissionById);
router.get("/hackathon/:hackathonId", protect, authorizeRoles("organizer", "judge"), getSubmissionsByHackathon);
router.get("/my/:hackathonId", protect, authorizeRoles("participant"), getMySubmission);

export default router;