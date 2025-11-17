// src/controllers/prescricao.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// =========================================================
// Helper — Busca usuário usando NOME (não email, não CPF)
// =========================================================
async function buscarUsuarioPorUserNome(userNome: string) {
  if (!userNome) return null;

  return prisma.user.findFirst({
    where: {
      nome: { equals: userNome, mode: "insensitive" },
    },
  });
}

// =========================================================
// GET /api/prescricao/:userNome
// Lista prescrições onde o usuário (por nome) aparece:
// - Como PACIENTE, OU
// - Como PROFISSIONAL
// =========================================================
export async function listarPrescricoesPorUserNome(
  req: Request,
  res: Response
) {
  try {
    const userNome = req.params.userNome;

    if (!userNome || userNome.trim().length === 0) {
      return res.status(400).json({ error: "userNome é obrigatório." });
    }

    const usuario = await buscarUsuarioPorUserNome(userNome);

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const prescricoes = await prisma.prescricao.findMany({
      where: {
        OR: [
          { pacienteId: usuario.id },
          { profissionalId: usuario.id },
        ],
      },
      include: {
        profissional: { select: { id: true, nome: true } },
        paciente: { select: { id: true, nome: true } },
      },
      orderBy: { criadoEm: "desc" },
    });

    return res.json({
      userNome: usuario.nome,
      prescricoes,
    });
  } catch (err) {
    console.error("Erro listar prescrições:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao listar prescrições." });
  }
}

// =========================================================
// POST /api/prescricao
// Cria nova prescrição (PROFISSIONAL autenticado)
// Body:
//   pacienteNome
//   tipo
//   conteudo
// =========================================================
export async function criarPrescricao(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    if (!user?.id) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    const { pacienteNome, tipo, conteudo } = req.body;

    if (!pacienteNome || !tipo || !conteudo) {
      return res.status(400).json({
        error: "Campos obrigatórios: pacienteNome, tipo, conteudo.",
      });
    }

    const paciente = await buscarUsuarioPorUserNome(pacienteNome);

    if (!paciente) {
      return res.status(404).json({ error: "Paciente não encontrado." });
    }

    const nova = await prisma.prescricao.create({
      data: {
        pacienteId: paciente.id,
        profissionalId: user.id,
        tipo,
        conteudo,
      },
    });

    return res.status(201).json(nova);
  } catch (err) {
    console.error("Erro criar prescrição:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao criar prescrição." });
  }
}

// =========================================================
// PUT /api/prescricao/:id
// =========================================================
export async function atualizarPrescricao(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { tipo, conteudo } = req.body;

    const existente = await prisma.prescricao.findUnique({ where: { id } });

    if (!existente) {
      return res.status(404).json({ error: "Prescrição não encontrada." });
    }

    if (existente.profissionalId !== user.id) {
      return res
        .status(403)
        .json({ error: "Não autorizado a editar esta prescrição." });
    }

    const atualizada = await prisma.prescricao.update({
      where: { id },
      data: {
        ...(tipo ? { tipo } : {}),
        ...(conteudo ? { conteudo } : {}),
      },
    });

    return res.json(atualizada);
  } catch (err) {
    console.error("Erro atualizar prescrição:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao atualizar prescrição." });
  }
}

// =========================================================
// DELETE /api/prescricao/:id
// =========================================================
export async function deletarPrescricao(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const existente = await prisma.prescricao.findUnique({
      where: { id },
    });

    if (!existente) {
      return res.status(404).json({ error: "Prescrição não encontrada." });
    }

    if (existente.profissionalId !== user.id) {
      return res
        .status(403)
        .json({ error: "Não autorizado a excluir." });
    }

    await prisma.prescricao.delete({ where: { id } });

    return res.json({ deleted: true });
  } catch (err) {
    console.error("Erro deletar prescrição:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao deletar prescrição." });
  }
}
