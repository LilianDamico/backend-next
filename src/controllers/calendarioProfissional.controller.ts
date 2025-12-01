// ============================================================
//  CONTROLLER — CALENDÁRIO PROFISSIONAL (MindCare)
// ============================================================

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper
const toDate = (s: string) => new Date(s);

// ============================================================
// GET /api/calendario/me
// ============================================================
export async function calendarioMe(req: Request, res: Response) {
  try {
    const user = req.user as any;

    const slots = await prisma.calendarioProfissional.findMany({
      where: { profissionalId: user.id },
      orderBy: { dataHora: "asc" },
    });

    return res.json({ profissionalId: user.id, slots });
  } catch (err) {
    console.error("Erro calendarioMe:", err);
    return res.status(500).json({ error: "Erro interno." });
  }
}

// ============================================================
// POST /api/calendario (criar horário único)
// ============================================================
export async function calendarioCriar(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const { dataHora, observacao } = req.body;

    const dt = toDate(dataHora);

    const existe = await prisma.calendarioProfissional.findFirst({
      where: { profissionalId: user.id, dataHora: dt },
    });

    if (existe) {
      return res.status(409).json({ error: "Horário já existe." });
    }

    const created = await prisma.calendarioProfissional.create({
      data: {
        profissionalId: user.id,
        dataHora: dt,
        observacao,
        disponivel: true,
      },
    });

    return res.json({ created });
  } catch (err) {
    console.error("Erro calendarioCriar:", err);
    return res.status(500).json({ error: "Erro interno." });
  }
}

// ============================================================
// POST /api/calendario/gerar-dia
// Geração automática de slots
// ============================================================
export async function calendarioGerarDia(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const { data, inicio, fim, intervalo, intervaloMinutos } = req.body;

    const step = intervaloMinutos ?? intervalo ?? 30;

    const inicioDate = new Date(`${data}T${inicio}:00`);
    const fimDate = new Date(`${data}T${fim}:00`);

    let current = new Date(inicioDate);
    const criados = [];

    while (current <= fimDate) {

      const existe = await prisma.calendarioProfissional.findFirst({
        where: { profissionalId: user.id, dataHora: current },
      });

      if (!existe) {
        const novo = await prisma.calendarioProfissional.create({
          data: {
            profissionalId: user.id,
            dataHora: new Date(current),
            disponivel: true,
          },
        });
        criados.push(novo);
      }

      current = new Date(current.getTime() + step * 60000);
    }

    return res.json({ criados });
  } catch (err) {
    console.error("Erro calendarioGerarDia:", err);
    return res.status(500).json({ error: "Erro interno." });
  }
}


// ============================================================
// PUT /api/calendario/:id — EDITAR HORÁRIO
// ============================================================
export async function calendarioAtualizar(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const { id } = req.params;
    const { observacao, disponivel } = req.body;

    const slot = await prisma.calendarioProfissional.findFirst({
      where: { id, profissionalId: user.id },
    });

    if (!slot) {
      return res.status(404).json({ error: "Horário não encontrado." });
    }

    const atualizado = await prisma.calendarioProfissional.update({
      where: { id },
      data: {
        observacao,
        disponivel,
      },
    });

    return res.json({ atualizado });
  } catch (err) {
    console.error("Erro calendarioAtualizar:", err);
    return res.status(500).json({ error: "Erro interno." });
  }
}

// ============================================================
// DELETE /api/calendario/:id
// ============================================================
export async function calendarioExcluir(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const { id } = req.params;

    const slot = await prisma.calendarioProfissional.findFirst({
      where: { id, profissionalId: user.id },
    });

    if (!slot) {
      return res.status(404).json({ error: "Horário não encontrado." });
    }

    await prisma.calendarioProfissional.delete({ where: { id } });

    return res.json({ deleted: true });
  } catch (err) {
    console.error("Erro calendarioExcluir:", err);
    return res.status(500).json({ error: "Erro interno." });
  }
}
