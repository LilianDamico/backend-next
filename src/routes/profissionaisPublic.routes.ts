import { Router } from "express";
import { listarProfissionaisPublicos } from "../controllers/profissional.controller";

const router = Router();

router.get("/", listarProfissionaisPublicos);

export default router;
