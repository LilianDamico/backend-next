import { Router } from "express";
import {
  criarUsuario,
  listarUsuarios,
  listarProfissionaisPublicos,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario,
} from "../controllers/user.controller";

const router = Router();

// Rotas públicas
router.post("/", criarUsuario);
router.get("/", listarUsuarios);
router.get("/public/profissionais", listarProfissionaisPublicos);
router.get("/:id", buscarUsuarioPorId);

// Rotas autenticadas
router.put("/", atualizarUsuario);
router.delete("/:id", deletarUsuario);

export default router;
