// src/routes/profissional.routes.ts
import { Router } from "express";
import { autenticarJWT } from "../middleware/authMiddleware.js";
import { permitirRoles } from "../middleware/roleMiddleware.js";

import {
  getPerfilProfissional,
  atualizarPerfilProfissional,
  listarHorariosDoProfissional,
  criarOuAtualizarHorario,
  listarConsultasAgendadas,
  buscarProfissionais
} from "../controllers/profissional.controller.js";

const router = Router();

/* ============================================================
   ROTAS DO PROFISSIONAL LOGADO
   ============================================================ */

// Perfil
router.get("/perfil", autenticarJWT, permitirRoles("PROFISSIONAL"), getPerfilProfissional);
router.put("/perfil", autenticarJWT, permitirRoles("PROFISSIONAL"), atualizarPerfilProfissional);

// Horários
router.get("/horarios", autenticarJWT, permitirRoles("PROFISSIONAL"), listarHorariosDoProfissional);
router.post("/horarios", autenticarJWT, permitirRoles("PROFISSIONAL"), criarOuAtualizarHorario);

// Consultas do profissional
router.get("/consultas", autenticarJWT, permitirRoles("PROFISSIONAL"), listarConsultasAgendadas);

/* ============================================================
   ROTA SEARCH (CLIENTE → BUSCAR PROFISSIONAL POR NOME)
   ============================================================ */
router.get("/buscar", autenticarJWT, buscarProfissionais);

export default router;
