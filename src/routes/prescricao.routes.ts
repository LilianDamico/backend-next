import { Router } from "express";
import { autenticarJWT } from "../middleware/authMiddleware.js";
import { permitirRoles } from "../middleware/roleMiddleware.js";
import {
  criarPrescricao,
  listarPrescricoesPorNomePaciente,
  listarPrescricoesPorNomeProfissional
} from "../controllers/prescricao.controller.js";

const router = Router();

router.post("/", autenticarJWT, permitirRoles("PROFISSIONAL"), criarPrescricao);
router.get("/paciente/:nome", autenticarJWT, permitirRoles("ADMIN", "PROFISSIONAL"), listarPrescricoesPorNomePaciente);
router.get("/profissional/:nome", autenticarJWT, permitirRoles("ADMIN", "PROFISSIONAL"), listarPrescricoesPorNomeProfissional);

export default router;

