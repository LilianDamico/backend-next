import express from "express";
import { listarPorUsuario } from "../controllers/prontuarios.controller.js";

const router = express.Router();

router.get("/:nome", listarPorUsuario);

export default router;
