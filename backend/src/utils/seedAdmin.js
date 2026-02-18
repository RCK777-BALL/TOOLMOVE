import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

export const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME || "Admin User";

  if (!email || !password) return;

  const existing = await User.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    email,
    passwordHash,
    fullName,
    isAdmin: true
  });
  console.log(`✅ Seeded admin user ${email}`);
};
