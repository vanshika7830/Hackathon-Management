import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import hackathonRoutes from "./routes/hackathonRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use("/auth", authRoutes);
app.use("/hackathons", hackathonRoutes);
app.use("/teams", teamRoutes);
app.use("/registrations", registrationRoutes);
app.use("/submissions", submissionRoutes);
app.use("/reviews", reviewRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/users", userRoutes);
app.use("/upload", uploadRoutes);


app.use(notFound);
app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});