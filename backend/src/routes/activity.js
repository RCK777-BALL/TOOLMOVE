import express from "express";
import { ToolMove } from "../models/ToolMove.js";
import { WeldTouchup } from "../models/WeldTouchup.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (_req, res) => {
  const [moves, welds] = await Promise.all([
    ToolMove.find({})
      .populate("reason", "name")
      .populate("department", "name")
      .populate("line", "name")
      .populate("station", "name")
      .lean(),
    WeldTouchup.find({})
      .populate("department", "name")
      .populate("line", "name")
      .populate("station", "name")
      .lean()
  ]);

  const items = [
    ...moves.map((m) => ({
      id: m._id,
      type: "tool_move",
      date: m.created_at,
      departmentName: m.department?.name || null,
      lineName: m.line?.name || null,
      stationName: m.station?.name || null,
      description: `Reason: ${m.reason?.name || "Unknown"}`,
      performedBy: m.movedBy,
      notes: m.notes,
      details: {
        reason: m.reason?.name,
        department: m.department?.name,
        line: m.line?.name,
        station: m.station?.name,
        notes: m.notes,
        moved_by: m.movedBy,
        requires_weld_touchup: m.requiresWeldTouchup,
        weld_touchup_completed: m.weldTouchupCompleted,
        weld_touchup_notes: m.weldTouchupNotes
      }
    })),
    ...welds.map((w) => ({
      id: w._id,
      type: "weld_touchup",
      date: w.created_at,
      departmentName: w.department?.name || null,
      lineName: w.line?.name || null,
      stationName: w.station?.name || null,
      description: `Part ${w.partNumber} - ${w.weldType} (${w.reason})`,
      performedBy: w.completedBy,
      notes: w.notes,
      details: {
        part_number: w.partNumber,
        weld_type: w.weldType,
        reason: w.reason,
        department: w.department?.name,
        line: w.line?.name,
        station: w.station?.name,
        notes: w.notes,
        completed_by: w.completedBy,
        status: w.status
      }
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json(items);
});

export default router;
