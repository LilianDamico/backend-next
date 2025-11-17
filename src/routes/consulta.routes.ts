import { Router } from "express";
import {
  criarConsulta,
  listarConsultasDoCliente,
  listarConsultasDoProfissional,
  cancelarConsulta,
  listarConsultasPorNomeCliente
} from "../controllers/consulta.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// CLIENTE
router.post("/", authMiddleware, criarConsulta);
router.get("/cliente/nome/:userNome", authMiddleware, listarConsultasDoCliente);
router.delete("/:id", authMiddleware, cancelarConsulta);
router.get("/cliente/nome/:userNome", authMiddleware, listarConsultasPorNomeCliente);


// PROFISSIONAL
router.get("/profissional", authMiddleware, listarConsultasDoProfissional);

export default router;
