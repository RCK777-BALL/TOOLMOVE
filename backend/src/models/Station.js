import { Schema, model, Types } from "mongoose";

const StationSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: "active" },
    line: { type: Types.ObjectId, ref: "Line", required: true }
  },
  { timestamps: true }
);

export const Station = model("Station", StationSchema);
