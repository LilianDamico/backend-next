import { Router } from "express";
import { autenticarJWT } from "../middleware/authMiddleware.js";
import { criarAvaliacao } from "../controllers/avaliacao.controller.js";

const router = Router();

router.post("/criar", autenticarJWT, criarAvaliacao);

export default router;
