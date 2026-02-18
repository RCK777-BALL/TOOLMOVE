import express from "express";
import { auth } from "../middleware/auth.js";
import { Notification } from "../models/Notification.js";

const router = express.Router();

// Get current user's notifications
router.get("/", auth, async (req, res) => {
  const items = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json(items);
});

// Mark as read
router.post("/:id/read", auth, async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true }
  );
  res.status(204).end();
});

export default router;
