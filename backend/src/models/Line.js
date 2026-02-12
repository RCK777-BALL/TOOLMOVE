import { Schema, model, Types } from "mongoose";

const LineSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: "active" },
    department: { type: Types.ObjectId, ref: "Department", required: true }
  },
  { timestamps: true }
);

export const Line = model("Line", LineSchema);
