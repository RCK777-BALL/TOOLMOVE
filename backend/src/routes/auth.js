import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

const sign = (user) =>
  jwt.sign(
    { sub: user._id.toString(), email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  return res.json({
    token: sign(user),
    user: { id: user._id, email: user.email, fullName: user.fullName, isAdmin: user.isAdmin }
  });
});

router.get("/me", auth, (req, res) => {
  const u = req.user;
  res.json({ id: u._id, email: u.email, fullName: u.fullName, isAdmin: u.isAdmin });
});

export default router;
