import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadSingleFile, uploadMultipleFiles } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/single", protect, upload.single("file"), uploadSingleFile);

router.post("/multiple", protect, upload.array("files", 5), uploadMultipleFiles);

export default router;
