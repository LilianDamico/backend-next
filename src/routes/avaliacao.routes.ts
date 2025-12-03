import { Router } from "express";
import { autenticarJWT } from "../middleware/authMiddleware";
import { criarAvaliacao } from "../controllers/avaliacao.controller";

const router = Router();

router.post("/criar", autenticarJWT, criarAvaliacao);

export default router;
