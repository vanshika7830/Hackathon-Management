import express from "express";
import {
    createHackathon,
    getAllHackathons,
    getHackathonById,
    updateHackathon,
    deleteHackathon,
    assignJudge,
} from "../controllers/hackathonController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllHackathons);
router.get("/:id", getHackathonById);

router.post("/", protect, authorizeRoles("organizer"), createHackathon);
router.put("/:id", protect, authorizeRoles("organizer"), updateHackathon);
router.delete("/:id", protect, authorizeRoles("organizer", "admin"), deleteHackathon);
router.patch("/:id/assign-judge", protect, authorizeRoles("organizer"), assignJudge);

export default router;