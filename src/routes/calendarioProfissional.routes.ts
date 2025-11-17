import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";

import {
  calendarioMe,
  calendarioCriar,
  calendarioGerarDia,
  calendarioAtualizar,
  calendarioExcluir,
} from "../controllers/calendarioProfissional.controller";

const router = Router();

router.get("/me", authMiddleware, calendarioMe);
router.post("/", authMiddleware, calendarioCriar);
router.post("/gerar-dia", authMiddleware, calendarioGerarDia);
router.put("/:id", authMiddleware, calendarioAtualizar);
router.delete("/:id", authMiddleware, calendarioExcluir);

export default router;
