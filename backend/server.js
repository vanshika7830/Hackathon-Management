import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use("/auth", authRoutes);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});