// src/routes/public.routes.ts
import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { listarHorariosPorNome } from "../controllers/public.controller.js";
import { triagemPublicHandler } from "../controllers/triagemPublic.controller.js";

const router = Router();

/**
 * 🔹 Retorna profissionais públicos (sem autenticação)
 */
router.get("/profissionais", async (req: Request, res: Response) => {
  try {
    const profissionais = await prisma.user.findMany({
      where: { tipo: "PROFISSIONAL" },
      select: {
        id: true,
        nome: true,
        especialidade: true,
        cidade: true,
        bio: true,
      },
      orderBy: { nome: "asc" },
    });

    return res.json(profissionais);
  } catch (error) {
    console.error("Erro ao listar profissionais públicos:", error);
    return res.status(500).json({ error: "Erro ao buscar profissionais." });
  }
});

/**
 * 🔹 Buscar horários por nome do profissional
 */
router.get("/horarios", listarHorariosPorNome);

/**
 * 🔥 Triagem pública (sem autenticação)
 */
router.post("/triagem", triagemPublicHandler);

export default router;
