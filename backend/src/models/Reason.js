import { Schema, model } from "mongoose";

const ReasonSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    status: { type: String, default: "active" }
  },
  { timestamps: true }
);

export const Reason = model("Reason", ReasonSchema);
