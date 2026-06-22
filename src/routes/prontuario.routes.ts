import express from "express";
import { autenticarJWT } from "../middleware/authMiddleware.js";
import { permitirRoles } from "../middleware/roleMiddleware.js";
import { listarPorUsuario } from "../controllers/prontuarios.controller.js";

const router = express.Router();

router.get("/:nome", autenticarJWT, permitirRoles("ADMIN", "PROFISSIONAL"), listarPorUsuario);

export default router;
