import { Router } from "express";
import { adminDashboardController } from "../controllers/adminDashboard.controller";

const router = Router();

router.get("/dashboard", adminDashboardController);

export default router;
