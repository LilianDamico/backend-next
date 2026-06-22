import { Router } from "express";
import { autenticarJWT } from "../middleware/authMiddleware.js";
import { permitirRoles } from "../middleware/roleMiddleware.js";

import {
  calendarioMe,
  calendarioCriar,
  calendarioGerarDia,
  calendarioAtualizar,
  calendarioExcluir,
} from "../controllers/calendarioProfissional.controller.js";

const router = Router();

router.get("/me", autenticarJWT, permitirRoles("PROFISSIONAL"), calendarioMe);
router.post("/", autenticarJWT, permitirRoles("PROFISSIONAL"), calendarioCriar);
router.post("/gerar-dia", autenticarJWT, permitirRoles("PROFISSIONAL"), calendarioGerarDia);
router.put("/:id", autenticarJWT, permitirRoles("PROFISSIONAL"), calendarioAtualizar);
router.delete("/:id", autenticarJWT, permitirRoles("PROFISSIONAL"), calendarioExcluir);

export default router;
