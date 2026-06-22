import { Router } from "express";
import { autenticarJWT } from "../middleware/authMiddleware.js";
import { permitirRoles } from "../middleware/roleMiddleware.js";
import {
  getPagamentos,
  createPagamento,
} from "../controllers/pagamento.controller.js";

const router = Router();

router.get("/", autenticarJWT, permitirRoles("ADMIN"), getPagamentos);
router.post("/", autenticarJWT, permitirRoles("ADMIN", "PROFISSIONAL"), createPagamento);

export default router;
