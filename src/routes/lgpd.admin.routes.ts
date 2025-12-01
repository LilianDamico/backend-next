import { Router } from "express";
import { listarConsentimentos, listarTermosUsuario } from "../controllers/lgpd.admin.controller";

function isAdmin(req: any, res: any, next: any) {
  if (!req.user || req.user.tipo !== "ADMIN")
    return res.status(403).json({ error: "Acesso restrito." });
  next();
}

const router = Router();

router.get("/admin/lgpd", isAdmin, listarConsentimentos);
router.get("/admin/lgpd/usuario/:userId", isAdmin, listarTermosUsuario);

export default router;
