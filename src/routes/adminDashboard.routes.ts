import { Router } from "express";
import { autenticarJWT } from "../middleware/authMiddleware.js";
import { permitirRoles } from "../middleware/roleMiddleware.js";
import { adminDashboardController } from "../controllers/adminDashboard.controller.js";

const router = Router();

router.get("/dashboard", autenticarJWT, permitirRoles("ADMIN"), adminDashboardController);

export default router;
