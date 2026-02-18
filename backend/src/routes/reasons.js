import express from "express";
import { Reason } from "../models/Reason.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (_req, res) => {
  const reasons = await Reason.find({}).sort({ name: 1 });
  res.json(reasons);
});

router.post("/", auth, requireAdmin, async (req, res) => {
  const reason = await Reason.create({
    name: req.body.name,
    description: req.body.description,
    status: req.body.status || "active"
  });
  res.status(201).json(reason);
});

router.delete("/:id", auth, requireAdmin, async (req, res) => {
  await Reason.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
