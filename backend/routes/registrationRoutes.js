import express from "express";
import {
    registerTeam,
    cancelRegistration,
    getMyRegistrations,
    getHackathonRegistrations,
    approveRegistration,
    rejectRegistration,
} from "../controllers/registrationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("participant"), registerTeam);
router.delete("/:id", protect, authorizeRoles("participant"), cancelRegistration);
router.get("/my-registrations", protect, authorizeRoles("participant"), getMyRegistrations);


router.get("/hackathon/:hackathonId", protect, authorizeRoles("organizer", "admin"), getHackathonRegistrations);
router.patch("/:id/approve", protect, authorizeRoles("organizer", "admin"), approveRegistration);
router.patch("/:id/reject", protect, authorizeRoles("organizer", "admin"), rejectRegistration);

export default router;
