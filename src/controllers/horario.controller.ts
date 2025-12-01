// ============================================================
// src/controllers/horario.controller.ts
// CONTROLADOR OFICIAL DE HORÁRIOS (por NOME do profissional)
// ============================================================

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// ------------------------------------------------------------
// Helper: busca profissional por nome (case-insensitive)
// ------------------------------------------------------------
async function buscarProfissionalPorNome(userNome: string) {
  if (!userNome) return null;

  const nomeNormalizado = userNome.trim();

  return prisma.user.findFirst({
    where: {
      nome: {
        equals: nomeNormalizado,
        mode: "insensitive",
      },
      tipo: "PROFISSIONAL",
    },
  });
}

// ============================================================
// 1) LISTAR HORÁRIOS POR NOME
// ============================================================

export async function listarHorariosPorNome(req: Request, res: Response) {
  try {
    const userNome = req.params.userNome;

    if (!userNome) {
      return res.status(400).json({
        error: "Nome do profissional é obrigatório.",
      });
    }

    const profissional = await buscarProfissionalPorNome(userNome);

    if (!profissional) {
      return res.status(404).json({
        error: "Profissional não encontrado.",
      });
    }

    const horarios = await prisma.calendarioProfissional.findMany({
      where: {
        profissionalId: profissional.id,
        disponivel: true,
      },
      orderBy: { dataHora: "asc" },
    });

    return res.json(horarios);
  } catch (error) {
    console.error("❌ listarHorariosPorNome:", error);
    return res.status(500).json({
      error: "Erro ao buscar horários.",
    });
  }
}

// ============================================================
// 2) CRIAR HORÁRIO POR NOME
// ============================================================

export async function criarHorarioPorNome(req: Request, res: Response) {
  try {
    const userNome = req.params.userNome;

    if (!userNome) {
      return res.status(400).json({
        error: "Nome do profissional é obrigatório.",
      });
    }

    const { dataHora, observacao } = req.body;

    if (!dataHora) {
      return res.status(400).json({ error: "dataHora é obrigatório." });
    }

    const profissional = await buscarProfissionalPorNome(userNome);

    if (!profissional) {
      return res.status(404).json({
        error: "Profissional não encontrado.",
      });
    }

    const dt = new Date(dataHora);

    const existente = await prisma.calendarioProfissional.findFirst({
      where: {
        profissionalId: profissional.id,
        dataHora: dt,
      },
    });

    if (existente) {
      return res.status(409).json({
        error: "Este horário já está cadastrado.",
      });
    }

    const criado = await prisma.calendarioProfissional.create({
      data: {
        profissionalId: profissional.id,
        dataHora: dt,
        observacao,
        disponivel: true,
      },
    });

    return res.status(201).json(criado);
  } catch (error) {
    console.error("❌ criarHorarioPorNome:", error);
    return res.status(500).json({
      error: "Erro ao criar horário.",
    });
  }
}

// ============================================================
// 3) ATUALIZAR HORÁRIO POR NOME
// ============================================================

export async function atualizarHorarioPorNome(req: Request, res: Response) {
  try {
    const userNome = req.params.userNome;

    if (!userNome) {
      return res.status(400).json({
        error: "Nome do profissional é obrigatório.",
      });
    }

    const { horarioId, disponivel, observacao } = req.body;

    if (!horarioId) {
      return res.status(400).json({
        error: "horarioId é obrigatório.",
      });
    }

    const profissional = await buscarProfissionalPorNome(userNome);

    if (!profissional) {
      return res.status(404).json({
        error: "Profissional não encontrado.",
      });
    }

    const slot = await prisma.calendarioProfissional.findFirst({
      where: {
        id: horarioId,
        profissionalId: profissional.id,
      },
    });

    if (!slot) {
      return res.status(404).json({
        error: "Horário não encontrado.",
      });
    }

    const atualizado = await prisma.calendarioProfissional.update({
      where: { id: horarioId },
      data: {
        ...(typeof disponivel === "boolean" ? { disponivel } : {}),
        ...(observacao !== undefined ? { observacao } : {}),
      },
    });

    return res.json(atualizado);
  } catch (error) {
    console.error("❌ atualizarHorarioPorNome:", error);
    return res.status(500).json({
      error: "Erro ao atualizar horário.",
    });
  }
}

// ============================================================
// 4) DELETAR HORÁRIO POR NOME
// ============================================================

export async function deletarHorarioPorNome(req: Request, res: Response) {
  try {
    const userNome = req.params.userNome;

    if (!userNome) {
      return res.status(400).json({
        error: "Nome do profissional é obrigatório.",
      });
    }

    const { horarioId } = req.body;

    if (!horarioId) {
      return res.status(400).json({
        error: "horarioId é obrigatório.",
      });
    }

    const profissional = await buscarProfissionalPorNome(userNome);

    if (!profissional) {
      return res.status(404).json({
        error: "Profissional não encontrado.",
      });
    }

    const slot = await prisma.calendarioProfissional.findFirst({
      where: {
        id: horarioId,
        profissionalId: profissional.id,
      },
    });

    if (!slot) {
      return res.status(404).json({
        error: "Horário não encontrado.",
      });
    }

    await prisma.calendarioProfissional.delete({
      where: { id: horarioId },
    });

    return res.json({ message: "Horário removido." });
  } catch (error) {
    console.error("❌ deletarHorarioPorNome:", error);
    return res.status(500).json({
      error: "Erro ao remover horário.",
    });
  }
}
