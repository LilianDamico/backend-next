// src/controllers/prontuario.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 *  GET /api/prontuarios/nome/:userNome
 *  Retorna todos os prontuários onde o usuário é cliente OU profissional
 */
export async function listarProntuariosPorUserNome(req: Request, res: Response) {
  try {
    const { userNome } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        nome: { equals: userNome, mode: "insensitive" },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Buscar prontuários das consultas onde ele é cliente ou profissional
    const prontuarios = await prisma.prontuario.findMany({
      where: {
        consulta: {
          OR: [
            { clienteId: user.id },
            { profissionalId: user.id },
          ],
        },
      },
      include: {
        consulta: {
          include: {
            profissional: true,
            cliente: true,
          },
        },
      },
      orderBy: {
        criadoEm: "desc",
      },
    });

    return res.json(prontuarios);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar prontuários." });
  }
}
