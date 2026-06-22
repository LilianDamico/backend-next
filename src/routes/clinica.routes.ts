import { Router } from "express";
import { autenticarJWT } from "../middleware/authMiddleware.js";
import { permitirRoles } from "../middleware/roleMiddleware.js";
import {
  getClinicas,
  createClinica,
} from "../controllers/clinica.controller.js";

const router = Router();

router.get("/", getClinicas);
router.post("/", autenticarJWT, permitirRoles("ADMIN"), createClinica);

export default router;
