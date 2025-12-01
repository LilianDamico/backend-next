import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// =======================================================
//  1️⃣ BUSCAR PROFISSIONAIS POR NOME
// =======================================================
export async function buscarProfissionaisPorNome(req: Request, res: Response) {
  const nome = req.query.nome as string;

  if (!nome || nome.trim().length < 2) {
    return res.status(400).json({ error: "Digite pelo menos 2 letras para buscar." });
  }

  try {
    const profissionais = await prisma.user.findMany({
      where: {
        tipo: "PROFISSIONAL",
        nome: { contains: nome, mode: "insensitive" },
      },
      select: {
        id: true,
        nome: true,
        especialidade: true,
        cidade: true,
        email: true,
        telefone: true,
      },
      orderBy: { nome: "asc" },
    });

    if (!profissionais.length) {
      return res.status(404).json({ message: "Nenhum profissional encontrado." });
    }

    return res.json(profissionais);
  } catch (error) {
    console.error("Erro em buscarProfissionaisPorNome:", error);
    return res.status(500).json({ error: "Erro ao buscar profissionais." });
  }
}

// =======================================================
//  2️⃣ LISTAR HORÁRIOS DISPONÍVEIS PELO NOME DO PROFISSIONAL
// =======================================================
export async function listarHorariosPorNome(req: Request, res: Response) {
  const { nome } = req.params;

  try {
    const profissional = await prisma.user.findFirst({
      where: {
        tipo: "PROFISSIONAL",
        nome: { equals: nome, mode: "insensitive" },
      },
      select: { id: true, nome: true, especialidade: true },
    });

    if (!profissional) {
      return res.status(404).json({ error: "Profissional não encontrado." });
    }

    const horarios = await prisma.calendarioProfissional.findMany({
      where: {
        profissionalId: profissional.id,
        disponivel: true,
      },
      select: {
        id: true,
        dataHora: true,
      },
      orderBy: { dataHora: "asc" },
    });

    return res.json({
      profissional,
      horarios,
    });
  } catch (error) {
    console.error("Erro listarHorariosPorNome:", error);
    return res.status(500).json({ error: "Erro ao buscar horários do profissional." });
  }
}
