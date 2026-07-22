import express from "express";
import {
    createTeam,
    joinTeam,
    leaveTeam,
    removeMember,
    transferLeadership,
    deleteTeam,
    getTeamById,
} from "../controllers/teamController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("participant"), createTeam);
router.post("/join", protect, authorizeRoles("participant"), joinTeam);
router.get("/:id", protect, getTeamById);
router.patch("/:id/leave", protect, authorizeRoles("participant"), leaveTeam);
router.patch("/:id/remove-member", protect, authorizeRoles("participant"), removeMember);
router.patch("/:id/transfer-leadership", protect, authorizeRoles("participant"), transferLeadership);
router.delete("/:id", protect, authorizeRoles("participant"), deleteTeam);

export default router;