import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

const router = express.Router();

/**
 * POST /api/seed/admin
 * Header: x-seed-token: <SEED_TOKEN>
 * Body: { email, password, name }
 */
router.post("/admin", async (req, res) => {
  try {
    const token = req.headers["x-seed-token"];
    if (!process.env.SEED_TOKEN || token !== process.env.SEED_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { email, password, name } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const emailNorm = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 12);

    // Idempotent upsert (safe to run multiple times)
    const admin = await User.findOneAndUpdate(
      { email: emailNorm },
      {
        $set: {
          name: name || "Admin",
          email: emailNorm,
          password: passwordHash,
          role: "admin", // <-- change if your schema differs
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    return res.json({
      ok: true,
      adminId: admin._id,
      email: admin.email,
      role: admin.role,
    });
  } catch (err) {
    console.error("Seed admin failed:", err);
    return res.status(500).json({ error: "Seed failed", details: String(err?.message || err) });
  }
});

export default router;
