import { Schema, model, Types } from "mongoose";

const ToolMoveSchema = new Schema(
  {
    reason: { type: Types.ObjectId, ref: "Reason", required: true },
    department: { type: Types.ObjectId, ref: "Department" },
    line: { type: Types.ObjectId, ref: "Line" },
    station: { type: Types.ObjectId, ref: "Station" },
    notes: { type: String },
    movedBy: { type: String, required: true },
    requiresWeldTouchup: { type: Boolean, default: false },
    weldTouchupCompleted: { type: Boolean, default: false },
    weldTouchupNotes: { type: String }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const ToolMove = model("ToolMove", ToolMoveSchema);
