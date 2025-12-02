// src/routes/profissional.routes.ts
import { Router } from "express";

import {
  getPerfilProfissional,
  atualizarPerfilProfissional,
  listarHorariosDoProfissional,
  criarOuAtualizarHorario,
  listarConsultasAgendadas,
  buscarProfissionais
} from "../controllers/profissional.controller";

const router = Router();

/* ============================================================
   ROTAS DO PROFISSIONAL LOGADO
   ============================================================ */

// Perfil
router.get("/perfil", getPerfilProfissional);
router.put("/perfil", atualizarPerfilProfissional);

// Horários
router.get("/horarios", listarHorariosDoProfissional);
router.post("/horarios", criarOuAtualizarHorario);

// Consultas do profissional
router.get("/consultas", listarConsultasAgendadas);

/* ============================================================
   ROTA SEARCH (CLIENTE → BUSCAR PROFISSIONAL POR NOME)
   ============================================================ */
router.get("/buscar", buscarProfissionais);

export default router;
