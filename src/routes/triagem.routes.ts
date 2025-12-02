// src/routes/triagem.routes.ts
import { Router } from "express";
import { triagemPublicHandler } from "../controllers/triagemPublic.controller";

const router = Router();

// Rota pública, sem autenticação
router.post("/triagem", triagemPublicHandler);

export default router;
