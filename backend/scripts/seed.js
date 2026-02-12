import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User.js";
import { Reason } from "../src/models/Reason.js";
import { Department } from "../src/models/Department.js";
import { Line } from "../src/models/Line.js";
import { Station } from "../src/models/Station.js";

const uri = process.env.MONGO_URI;

async function connect() {
  if (!uri) throw new Error("MONGO_URI is not set in .env");
  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");
}

async function wipe() {
  const models = [Reason, Station, Line, Department, User];
  for (const M of models) {
    await M.deleteMany({});
    console.log(`🧹 Cleared ${M.modelName}`);
  }
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const fullName = process.env.ADMIN_NAME || "Admin User";
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await User.create({
    email,
    passwordHash,
    fullName,
    isAdmin: true,
  });
  console.log(`👤 Seeded admin ${email} (password: ${password})`);
  return admin;
}

async function seedAdditionalUsers() {
  const commonPassword = "Password123!";
  const passwordHash = await bcrypt.hash(commonPassword, 10);

  const users = await User.insertMany([
    {
      email: "manager@example.com",
      fullName: "Manager User",
      department: "Operations",
      isAdmin: false,
      passwordHash,
    },
    {
      email: "supervisor@example.com",
      fullName: "Supervisor User",
      department: "Production",
      isAdmin: false,
      passwordHash,
    },
    {
      email: "technician@example.com",
      fullName: "Technician User",
      department: "Maintenance",
      isAdmin: false,
      passwordHash,
    },
  ]);

  console.log(
    `👥 Seeded additional users (password: ${commonPassword}): ${users
      .map((u) => u.email)
      .join(", ")}`
  );
}

async function seedHierarchy() {
  // Department 1: Ford Bronco
  const bronco = await Department.create({ name: "Ford Bronco", description: "Bronco program" });

  const broncoLines = await Line.insertMany([
    { name: "Front Mod", department: bronco._id },
    { name: "Rear Mod", department: bronco._id },
    { name: "Final Line", department: bronco._id },
  ]);

  const broncoLineMap = {};
  broncoLines.forEach((l) => { broncoLineMap[l.name] = l; });

  const broncoStations = await Station.insertMany([
    { name: "Station 5", line: broncoLineMap["Front Mod"]._id },
    { name: "Station 10", line: broncoLineMap["Rear Mod"]._id },
    { name: "Station 15", line: broncoLineMap["Rear Mod"]._id },
    { name: "Station 20", line: broncoLineMap["Final Line"]._id },
    { name: "Station 25", line: broncoLineMap["Final Line"]._id },
  ]);

  console.log("🏭 Seeded Ford Bronco with 3 lines and stations");

  // Department 2: WD
  const wd = await Department.create({ name: "WD", description: "WD program" });

  const wdLines = await Line.insertMany([
    { name: "2 Rears", department: wd._id },
    { name: "3 Fronts", department: wd._id },
  ]);

  const wdLineMap = {};
  wdLines.forEach((l) => { wdLineMap[l.name] = l; });

  const wdStations = await Station.insertMany([
    { name: "Station 10", line: wdLineMap["2 Rears"]._id },
    { name: "Station 20", line: wdLineMap["2 Rears"]._id },
    { name: "Station 30", line: wdLineMap["2 Rears"]._id },
    { name: "Station 40", line: wdLineMap["2 Rears"]._id },
    { name: "Station 50", line: wdLineMap["3 Fronts"]._id },
    { name: "Station 60", line: wdLineMap["3 Fronts"]._id },
    { name: "Station 70", line: wdLineMap["3 Fronts"]._id },
    { name: "Station 80", line: wdLineMap["3 Fronts"]._id },
    { name: "Station 90", line: wdLineMap["3 Fronts"]._id },
  ]);

  console.log("🏭 Seeded WD with 2 lines and stations");
  return { bronco, broncoLines, broncoStations, wd, wdLines, wdStations };
}

async function seedReasons() {
  const reasons = [
    "Lack of Fusion",
    "Porosity",
    "Gap",
    "WCR",
    "Measurement (Perception, Bluewrist)",
    "Off-Location",
    "Underfill",
    "Heat Adjustment",
  ];

  await Reason.insertMany(reasons.map((name) => ({ name, status: "active" })));
  console.log(`📄 Seeded reasons: ${reasons.join(", ")}`);
}

async function run() {
  await connect();
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed in production");
  }
  await wipe();
  await seedAdmin();
  await seedAdditionalUsers();
  await seedHierarchy();
  await seedReasons();
  await mongoose.disconnect();
  console.log("✅ Seeding complete");
}

run().catch(async (err) => {
  console.error("❌ Seeding failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
