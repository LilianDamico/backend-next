import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const listarConsentimentos = async (req: Request, res: Response) => {
  const { userId } = req.query;
  const where = userId ? { userId: String(userId) } : {};

  res.json(await prisma.consentimento.findMany({
    where,
    orderBy: { criadoEm: "desc" },
    include: { user: true }
  }));
};

export const listarTermosUsuario = async (req: Request, res: Response) => {
  const { userId } = req.params;
  res.json({
    usuario: await prisma.user.findUnique({ where: { id: userId }}),
    consentimentos: await prisma.consentimento.findMany({
      where: { userId },
      orderBy: { criadoEm: "desc" }
    })
  });
};
