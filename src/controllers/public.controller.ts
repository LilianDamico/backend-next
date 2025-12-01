import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// ========================================================
// 🔍 LISTAR HORÁRIOS DISPONÍVEIS POR NOME DO PROFISSIONAL
// ========================================================
export async function listarHorariosPorNome(req: Request, res: Response) {
  try {
    const nome = req.query.nome as string;

    if (!nome) {
      return res.status(400).json({ error: "O nome do profissional é obrigatório." });
    }

    // Busca o profissional pelo nome (case insensitive)
    const profissional = await prisma.user.findFirst({
      where: {
        tipo: "PROFISSIONAL",
        nome: { contains: nome, mode: "insensitive" },
      },
      select: { id: true, nome: true },
    });

    if (!profissional) {
      return res.status(404).json({ error: "Profissional não encontrado." });
    }

    // Busca horários disponíveis
    const horarios = await prisma.calendarioProfissional.findMany({
      where: { profissionalId: profissional.id, disponivel: true },
      orderBy: { dataHora: "asc" },
    });

    return res.json({ profissional, horarios });
  } catch (error) {
    console.error("Erro listarHorariosPorNome:", error);
    return res.status(500).json({ error: "Erro ao buscar horários." });
  }
}
