import { Router } from "express";
import { autenticarJWT } from "../middleware/authMiddleware.js";
import { listarConsentimentos, listarTermosUsuario } from "../controllers/lgpd.admin.controller.js";

function isAdmin(req: any, res: any, next: any) {
  if (!req.user || req.user.tipo !== "ADMIN")
    return res.status(403).json({ error: "Acesso restrito." });
  next();
}

const router = Router();

router.get("/admin/lgpd", autenticarJWT, isAdmin, listarConsentimentos);
router.get("/admin/lgpd/usuario/:userId", autenticarJWT, isAdmin, listarTermosUsuario);

export default router;
