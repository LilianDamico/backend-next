import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { listarHorariosPorNome } from "../controllers/public.controller";
import { triagemPublicHandler } from "../controllers/triagemPublic.controller";

const router = Router();
const prisma = new PrismaClient();

// 🔹 Retorna profissionais públicos (sem autenticação)
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

router.get("/horarios", listarHorariosPorNome);

router.post("triagem", triagemPublicHandler);

export default router;
