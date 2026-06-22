import { Router } from "express";
import { listarProfissionaisPublicos } from "../controllers/profissional.controller.js";

const router = Router();

router.get("/", listarProfissionaisPublicos);

export default router;
