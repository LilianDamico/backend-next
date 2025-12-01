import { Router } from "express";
import { autenticarJWT } from "../middleware/authMiddleware";
import {
  criarConsulta,
  listarConsultasDoCliente,
  listarConsultasDoProfissional,
  listarConsultasPorClienteNome,
  cancelarConsulta
} from "../controllers/consulta.controller";

const router = Router();

router.post("/", autenticarJWT, criarConsulta);
router.get("/cliente", autenticarJWT, listarConsultasDoCliente);
router.get("/profissional", autenticarJWT, listarConsultasDoProfissional);
router.get("/cliente/nome/:userNome", listarConsultasPorClienteNome); 
router.patch("/cancelar/:id", autenticarJWT, cancelarConsulta);

export default router;
