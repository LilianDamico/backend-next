import { Router } from "express";
import { autenticarJWT } from "../middleware/authMiddleware.js";
import { permitirRoles } from "../middleware/roleMiddleware.js";
import {
  criarConsulta,
  listarConsultasDoCliente,
  listarConsultasDoProfissional,
  listarConsultasPorClienteNome,
  cancelarConsulta
} from "../controllers/consulta.controller.js";

const router = Router();

router.post("/", autenticarJWT, permitirRoles("CLIENTE"), criarConsulta);
router.get("/cliente", autenticarJWT, permitirRoles("CLIENTE"), listarConsultasDoCliente);
router.get("/profissional", autenticarJWT, permitirRoles("PROFISSIONAL"), listarConsultasDoProfissional);
router.get("/cliente/nome/:userNome", autenticarJWT, permitirRoles("ADMIN", "PROFISSIONAL"), listarConsultasPorClienteNome);
router.patch("/cancelar/:id", autenticarJWT, permitirRoles("CLIENTE"), cancelarConsulta);

export default router;
