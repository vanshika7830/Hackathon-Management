import express from "express";
import { signup, login, getMe, createJudge, updateUserRole, changePassword, forgotPassword, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/create-judge", protect, authorizeRoles("admin"), createJudge);
router.patch("/users/:id/role", protect, authorizeRoles("admin"), updateUserRole);
router.patch("/change-password", protect, changePassword);

export default router;