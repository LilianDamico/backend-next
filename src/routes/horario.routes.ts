import { Router } from "express";
import { autenticarJWT } from "../middleware/authMiddleware";
import { permitirRoles } from "../middleware/roleMiddleware";
import {
  listarHorariosPorNome,
  criarHorarioPorNome,
  atualizarHorarioPorNome,
  deletarHorarioPorNome,
} from "../controllers/horario.controller";

const router = Router();

// CLIENTE e PROFISSIONAL podem listar horários de um profissional por nome
router.get(
  "/nome/:userNome",
  autenticarJWT,
  permitirRoles("CLIENTE", "PROFISSIONAL"),
  listarHorariosPorNome
);

// As três de baixo são opcionais — só use se quiser manipular por nome
router.post(
  "/nome/:userNome",
  autenticarJWT,
  permitirRoles("PROFISSIONAL"),
  criarHorarioPorNome
);

router.put(
  "/nome/:userNome",
  autenticarJWT,
  permitirRoles("PROFISSIONAL"),
  atualizarHorarioPorNome
);

router.delete(
  "/nome/:userNome",
  autenticarJWT,
  permitirRoles("PROFISSIONAL"),
  deletarHorarioPorNome
);

export default router;
