import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 🔹 Lista todas as avaliações
 */
export const getAvaliacoes = async (req: Request, res: Response) => {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      include: { consulta: true },
    });
    res.json(avaliacoes);
  } catch (error) {
    console.error("❌ Erro ao buscar avaliações:", error);
    res.status(500).json({ error: "Erro ao buscar avaliações" });
  }
};

/**
 * 🔹 Cria uma nova avaliação
 */
export const createAvaliacao = async (req: Request, res: Response) => {
  const { nota, comentario, consultaId } = req.body;

  try {
    const avaliacao = await prisma.avaliacao.create({
      data: { nota, comentario, consultaId },
    });
    res.status(201).json(avaliacao);
  } catch (error) {
    console.error("❌ Erro ao criar avaliação:", error);
    res.status(500).json({ error: "Erro ao criar avaliação" });
  }
};
