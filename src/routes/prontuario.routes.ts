// ============================================================
//  📋 prontuario.routes.ts — MindCare SaaS 2025
//  Totalmente compatível com o schema Prisma atualizado
// ============================================================

import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";
import { listarProntuariosPorUserNome } from "../controllers/Prontuarios.controller";

const router = Router();
const prisma = new PrismaClient();

// ============================================================
// 🔹 Listar todos os prontuários (apenas profissionais)
// GET /prontuarios
// ============================================================
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const prontuarios = await prisma.prontuario.findMany({
      include: {
        consulta: {
          include: {
            cliente: { select: { nome: true, email: true } },
            profissional: { select: { nome: true, especialidade: true } },
          },
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    return res.status(200).json(prontuarios);
  } catch (error) {
    console.error("❌ Erro ao listar prontuários:", error);
    return res.status(500).json({ error: "Erro ao buscar prontuários." });
  }
});

// ============================================================
// 🔹 Criar novo prontuário vinculado a uma consulta
// POST /prontuarios
// Body: { descricao: string, consultaId: string }
// ============================================================
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { descricao, consultaId } = req.body;

    if (!descricao || !consultaId) {
      return res
        .status(400)
        .json({ error: "Descrição e consultaId são obrigatórios." });
    }

    const consultaExiste = await prisma.consulta.findUnique({
      where: { id: consultaId },
    });

    if (!consultaExiste) {
      return res.status(404).json({ error: "Consulta não encontrada." });
    }

    const novoProntuario = await prisma.prontuario.create({
      data: {
        descricao,
        consulta: { connect: { id: consultaId } },
      },
      include: {
        consulta: {
          include: {
            cliente: { select: { nome: true } },
            profissional: { select: { nome: true } },
          },
        },
      },
    });

    return res.status(201).json(novoProntuario);
  } catch (error) {
    console.error("❌ Erro ao criar prontuário:", error);
    return res.status(500).json({ error: "Erro ao criar prontuário." });
  }
});

// ============================================================
// 🔹 Buscar prontuários por ID da consulta
// GET /prontuarios/consulta/:id
// ============================================================
router.get(
  "/consulta/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const prontuarios = await prisma.prontuario.findMany({
        where: { consultaId: id },
        include: {
          consulta: {
            include: {
              cliente: { select: { nome: true } },
              profissional: { select: { nome: true } },
            },
          },
        },
      });

      if (!prontuarios.length) {
        return res
          .status(404)
          .json({ message: "Nenhum prontuário encontrado para esta consulta." });
      }

      return res.status(200).json(prontuarios);
    } catch (error) {
      console.error("❌ Erro ao buscar prontuários por consulta:", error);
      return res.status(500).json({ error: "Erro ao buscar prontuários." });
    }
  }
);

// ============================================================
// 🔹 Excluir prontuário
// DELETE /prontuarios/:id
// ============================================================
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existe = await prisma.prontuario.findUnique({ where: { id } });
    if (!existe) {
      return res.status(404).json({ error: "Prontuário não encontrado." });
    }

    await prisma.prontuario.delete({ where: { id } });

    return res.status(200).json({ message: "✅ Prontuário excluído com sucesso." });
  } catch (error) {
    console.error("❌ Erro ao excluir prontuário:", error);
    return res.status(500).json({ error: "Erro ao excluir prontuário." });
  }
});


// Buscar prontuários por nome (cliente ou profissional)
router.get("/nome/:userNome", authMiddleware, listarProntuariosPorUserNome);

export default router;
