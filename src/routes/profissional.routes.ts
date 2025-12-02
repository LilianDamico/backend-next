import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

/**
 * Buscar profissionais por nome
 */
router.get("/buscar", async (req, res) => {
  try {
    const { nome } = req.query;

    if (!nome) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    const profissionais = await prisma.user.findMany({
      where: {
        tipo: "PROFISSIONAL",
        nome: {
          contains: String(nome),
          mode: "insensitive",
        },
      },
    });

    return res.json({ profissionais });
  } catch (e) {
    console.error("Erro ao buscar profissionais:", e);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

export default router;
