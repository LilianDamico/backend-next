// src/middleware/requireLgpd.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const requireLgpdAtivo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Não autenticado." });
  }

  const ultimo = await prisma.consentimento.findFirst({
    where: { userId: user.id },
    orderBy: { criadoEm: "desc" }
  });

  if (!ultimo || !ultimo.aceito) {
    return res.status(428).json({
      error: "LGPD_CONSENT_REQUIRED",
      message: "É necessário aceitar a Política de Privacidade para usar o sistema."
    });
  }

  // se tiver expiração e já tiver passado, também bloqueia
  if (ultimo.expiraEm && ultimo.expiraEm < new Date()) {
    return res.status(428).json({
      error: "LGPD_CONSENT_EXPIRED",
      message: "Seu consentimento expirou. Aceite novamente a Política de Privacidade."
    });
  }

  return next();
};
