import { Router } from "express";
import { autenticarJWT } from "../middleware/authMiddleware";

import {
  calendarioMe,
  calendarioCriar,
  calendarioGerarDia,
  calendarioAtualizar,
  calendarioExcluir,
} from "../controllers/calendarioProfissional.controller";

const router = Router();

router.get("/me", autenticarJWT, calendarioMe);
router.post("/", autenticarJWT, calendarioCriar);
router.post("/gerar-dia", autenticarJWT, calendarioGerarDia);
router.put("/:id", autenticarJWT, calendarioAtualizar);
router.delete("/:id", autenticarJWT, calendarioExcluir);

export default router;
