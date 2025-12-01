import express from "express";
import { listarPorUsuario } from "../controllers/prontuarios.controller";

const router = express.Router();

router.get("/:nome", listarPorUsuario);

export default router;
