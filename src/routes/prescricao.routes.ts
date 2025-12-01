import { Router } from "express";
import {
  criarPrescricao,
  listarPrescricoesPorNomePaciente,
  listarPrescricoesPorNomeProfissional
} from "../controllers/prescricao.controller";

const router = Router();

// Criar nova prescrição
router.post("/", criarPrescricao);

// Buscar por nome do paciente
router.get("/paciente/:nome", listarPrescricoesPorNomePaciente);

// Buscar por nome do profissional
router.get("/profissional/:nome", listarPrescricoesPorNomeProfissional);

export default router;

