import { Router } from "express";
import {
  buscarProfissionaisPorNome,
  listarHorariosPorNome,
} from "../controllers/agenda.controller";

const router = Router();

// Ex: GET /api/agenda/buscar?nome=Ana
router.get("/buscar", buscarProfissionaisPorNome);

// Ex: GET /api/agenda/Ana%20Silva/horarios
router.get("/:nome/horarios", listarHorariosPorNome);

export default router;
