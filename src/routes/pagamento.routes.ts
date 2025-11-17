import { Router } from "express";
import {
  getPagamentos,
  createPagamento,
} from "../controllers/pagamento.controller";

const router = Router();

router.get("/", getPagamentos);
router.post("/", createPagamento);

export default router;
