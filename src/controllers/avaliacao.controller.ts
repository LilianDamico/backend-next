import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function criarAvaliacao(req: Request, res: Response) {
  try {
    const { consultaId, nota, comentario } = req.body;
    const userId = req.user?.id;

    if (!consultaId || !nota) {
      return res.status(400).json({
        error: "ConsultaId e nota são obrigatórios."
      });
    }

    // Verifica se consulta existe e pertence ao usuário
    const consulta = await prisma.consulta.findUnique({
      where: { id: consultaId },
      include: { cliente: true }
    });

    if (!consulta) {
      return res.status(404).json({ error: "Consulta não encontrada." });
    }

    if (consulta.clienteId !== userId) {
      return res.status(403).json({ error: "Você não pode avaliar esta consulta." });
    }

    // Evita avaliação duplicada
    const existe = await prisma.avaliacao.findFirst({
      where: { consultaId }
    });

    if (existe) {
      return res.status(400).json({
        error: "Esta consulta já foi avaliada."
      });
    }

    const avaliacao = await prisma.avaliacao.create({
      data: {
        consultaId,
        nota,
        comentario: comentario || null
      }
    });

    return res.json({
      sucesso: true,
      avaliacao
    });

  } catch (err: any) {
    console.error("Erro ao criar avaliação:", err);
    return res.status(500).json({
      error: "Erro interno ao registrar avaliação.",
      detalhes: err.message
    });
  }
}
