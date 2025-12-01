import { Router } from "express";
import {
  criarPrescricao,
  listarPrescricoesPorNomePaciente,
  listarPrescricoesPorNomeProfissional
} from "../controllers/prescricao.controller";

const router = Router();

router.post("/", criarPrescricao);
router.get("/paciente/nome/:nome", listarPrescricoesPorNomePaciente);
router.get("/profissional/nome/:nome", listarPrescricoesPorNomeProfissional);

export default router;
