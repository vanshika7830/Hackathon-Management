import express from "express";
import {
    getAllUsers,
    getUsersByRole,
    getUserById,
    updateUser,
    deleteUser,
    toggleBlockUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("admin"), getAllUsers);
router.get("/role", protect, getUsersByRole);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);
router.patch("/:id/toggle-block", protect, authorizeRoles("admin"), toggleBlockUser);

export default router;