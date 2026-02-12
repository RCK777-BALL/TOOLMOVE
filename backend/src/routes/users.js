import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, requireAdmin, async (_req, res) => {
  const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 });
  res.json(users);
});

router.post("/", auth, requireAdmin, async (req, res) => {
  const { email, password, fullName, department, isAdmin } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "User already exists" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, fullName, department, isAdmin: !!isAdmin });
  res.status(201).json({ id: user._id, email: user.email, fullName: user.fullName, isAdmin: user.isAdmin });
});

router.delete("/:id", auth, requireAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
