import express from "express";
import { WeldTouchup } from "../models/WeldTouchup.js";
import { auth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";

const router = express.Router();

router.get("/", auth, async (_req, res) => {
  const welds = await WeldTouchup.find({})
    .populate("department", "name")
    .populate("line", "name")
    .populate("station", "name")
    .sort({ created_at: -1 });
  res.json(welds);
});

router.post("/", auth, async (req, res) => {
  const doc = await WeldTouchup.create({
    partNumber: req.body.partNumber,
    weldType: req.body.weldType,
    reason: req.body.reason,
    department: req.body.department || null,
    line: req.body.line || null,
    station: req.body.station || null,
    notes: req.body.notes || "",
    completedBy: req.body.completedBy || req.user.email,
    status: req.body.status || "pending"
  });
  const populated = await doc
    .populate("department", "name")
    .populate("line", "name")
    .populate("station", "name");
  res.status(201).json(populated);

  // notify all users
  try {
    const users = await User.find({}, "_id email").lean();
    const msg = `Weld touch up requested: ${req.body.partNumber || ''} (${req.body.reason || 'No reason'})`;
    const notifications = users.map((u) => ({
      user: u._id,
      message: msg,
    }));
    await Notification.insertMany(notifications);
  } catch (err) {
    console.error("Failed to create notifications", err);
  }
});

router.patch("/:id", auth, async (req, res) => {
  const updated = await WeldTouchup.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      notes: req.body.notes,
      completedBy: req.body.completedBy
    },
    { new: true }
  );
  res.json(updated);
});

router.delete("/:id", auth, async (req, res) => {
  await WeldTouchup.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
