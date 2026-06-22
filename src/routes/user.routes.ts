import { Router } from "express";
import { autenticarJWT } from "../middleware/authMiddleware.js";
import { permitirRoles } from "../middleware/roleMiddleware.js";
import {
  criarUsuario,
  listarUsuarios,
  listarProfissionaisPublicos,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario,
} from "../controllers/user.controller.js";

const router = Router();

// Rotas públicas
router.post("/", criarUsuario);
router.get("/public/profissionais", listarProfissionaisPublicos);

// Requer autenticação
router.get("/", autenticarJWT, permitirRoles("ADMIN"), listarUsuarios);
router.get("/:id", autenticarJWT, buscarUsuarioPorId);
router.put("/", autenticarJWT, atualizarUsuario);
router.delete("/:id", autenticarJWT, permitirRoles("ADMIN"), deletarUsuario);

export default router;
