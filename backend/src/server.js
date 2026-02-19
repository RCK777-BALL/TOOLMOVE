import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { seedAdmin } from "./utils/seedAdmin.js";
import authRoutes from "./routes/auth.js";
import toolMoveRoutes from "./routes/toolMoves.js";
import weldRoutes from "./routes/welds.js";
import locationRoutes from "./routes/locations.js";
import reasonRoutes from "./routes/reasons.js";
import userRoutes from "./routes/users.js";
import activityRoutes from "./routes/activity.js";
import notificationRoutes from "./routes/notifications.js";

import seedRoutes from "./routes/seedRoutes.js";


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: [
    process.env.CORS_ORIGIN
  ],
  credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/tool-moves", toolMoveRoutes);
app.use("/welds", weldRoutes);
app.use("/locations", locationRoutes);
app.use("/reasons", reasonRoutes);
app.use("/users", userRoutes);
app.use("/activity", activityRoutes);
app.use("/notifications", notificationRoutes);


app.use("/api/seed", seedRoutes);


app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const start = async () => {
  await connectDB();
  await seedAdmin();
  app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
};

start().catch((e) => {
  console.error("❌ Failed to start server", e);
  process.exit(1);
});
