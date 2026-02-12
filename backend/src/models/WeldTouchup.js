import { Schema, model, Types } from "mongoose";

const WeldTouchupSchema = new Schema(
  {
    partNumber: { type: String, required: true },
    weldType: { type: String, required: true },
    reason: { type: String, required: true },
    department: { type: Types.ObjectId, ref: "Department" },
    line: { type: Types.ObjectId, ref: "Line" },
    station: { type: Types.ObjectId, ref: "Station" },
    notes: { type: String },
    completedBy: { type: String, required: true },
    status: { type: String, default: "pending" }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const WeldTouchup = model("WeldTouchup", WeldTouchupSchema);
