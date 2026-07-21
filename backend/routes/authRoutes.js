import express from "express";
import { signup, login, createJudge, updateUserRole } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js"

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/createjudge", protect, authorizeRoles("admin"), createJudge);
router.patch("/users/:id/role", protect, authorizeRoles("admin"), updateUserRole);

export default router;