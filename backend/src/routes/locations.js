import express from "express";
import { Department } from "../models/Department.js";
import { Line } from "../models/Line.js";
import { Station } from "../models/Station.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (_req, res) => {
  const departments = await Department.find({}).lean();
  const lines = await Line.find({}).lean();
  const stations = await Station.find({}).lean();

  const withHierarchy = departments.map((dept) => ({
    ...dept,
    lines: lines
      .filter((l) => l.department?.toString() === dept._id.toString())
      .map((line) => ({
        ...line,
        stations: stations.filter((s) => s.line?.toString() === line._id.toString())
      }))
  }));

  res.json(withHierarchy);
});

router.post("/departments", auth, requireAdmin, async (req, res) => {
  const dept = await Department.create({
    name: req.body.name,
    description: req.body.description,
    status: req.body.status || "active"
  });
  res.status(201).json(dept);
});

router.delete("/departments/:id", auth, requireAdmin, async (req, res) => {
  await Department.findByIdAndDelete(req.params.id);
  await Line.deleteMany({ department: req.params.id });
  await Station.deleteMany({ line: req.params.id });
  res.status(204).end();
});

router.post("/lines", auth, requireAdmin, async (req, res) => {
  const line = await Line.create({
    name: req.body.name,
    description: req.body.description,
    status: req.body.status || "active",
    department: req.body.department
  });
  res.status(201).json(line);
});

router.delete("/lines/:id", auth, requireAdmin, async (req, res) => {
  await Line.findByIdAndDelete(req.params.id);
  await Station.deleteMany({ line: req.params.id });
  res.status(204).end();
});

router.post("/stations", auth, requireAdmin, async (req, res) => {
  const station = await Station.create({
    name: req.body.name,
    description: req.body.description,
    status: req.body.status || "active",
    line: req.body.line
  });
  res.status(201).json(station);
});

router.delete("/stations/:id", auth, requireAdmin, async (req, res) => {
  await Station.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
