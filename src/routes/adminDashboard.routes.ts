// src/routes/adminDashboard.routes.ts
import { Router } from "express";
import { getAdminDashboard } from "../controllers/adminDashboard.controller";

const router = Router();

// GET /api/admin/dashboard
router.get("/dashboard", getAdminDashboard);

export default router;
