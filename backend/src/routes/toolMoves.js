import express from "express";
import { ToolMove } from "../models/ToolMove.js";
import { Reason } from "../models/Reason.js";
import { Department } from "../models/Department.js";
import { Line } from "../models/Line.js";
import { Station } from "../models/Station.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (_req, res) => {
  const moves = await ToolMove.find({})
    .populate("reason", "name")
    .populate("department", "name")
    .populate("line", "name")
    .populate("station", "name")
    .sort({ created_at: -1 });
  res.json(moves);
});

router.post("/", auth, async (req, res) => {
  const body = req.body;
  const reason = await Reason.findById(body.reason);
  if (!reason) return res.status(400).json({ message: "Reason not found" });
  const doc = await ToolMove.create({
    reason: body.reason,
    department: body.department || null,
    line: body.line || null,
    station: body.station || null,
    notes: body.notes || "",
    movedBy: body.movedBy || req.user.email,
    requiresWeldTouchup: !!body.requiresWeldTouchup,
    weldTouchupCompleted: !!body.weldTouchupCompleted,
    weldTouchupNotes: body.weldTouchupNotes || ""
  });
  const populated = await doc.populate([
    { path: "reason", select: "name" },
    { path: "department", select: "name" },
    { path: "line", select: "name" },
    { path: "station", select: "name" },
  ]);
  res.status(201).json(populated);
});

router.delete("/:id", auth, requireAdmin, async (req, res) => {
  await ToolMove.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

router.patch("/:id", auth, async (req, res) => {
  const updated = await ToolMove.findByIdAndUpdate(
    req.params.id,
    {
      requiresWeldTouchup: req.body.requiresWeldTouchup,
      weldTouchupCompleted: req.body.weldTouchupCompleted,
      weldTouchupNotes: req.body.weldTouchupNotes
    },
    { new: true }
  );
  res.json(updated);
});

export default router;
