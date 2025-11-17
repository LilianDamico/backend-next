import { Router } from "express";
import {
  listarPrescricoesPorUserNome,
  criarPrescricao,
  atualizarPrescricao,
  deletarPrescricao
} from "../controllers/prescricao.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Todas as rotas exigem token
router.get("/:userNome", authMiddleware, listarPrescricoesPorUserNome);
router.post("/", authMiddleware, criarPrescricao);
router.put("/:id", authMiddleware, atualizarPrescricao);
router.delete("/:id", authMiddleware, deletarPrescricao);

export default router;
