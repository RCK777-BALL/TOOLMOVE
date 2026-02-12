import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    fullName: { type: String },
    passwordHash: { type: String, required: true },
    department: { type: String },
    isAdmin: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const User = model("User", UserSchema);
