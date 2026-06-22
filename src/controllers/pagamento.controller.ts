import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

/**
 * 🔹 Lista todos os pagamentos
 */
export const getPagamentos = async (req: Request, res: Response) => {
  try {
    const pagamentos = await prisma.pagamento.findMany({
      include: { consulta: true },
    });
    res.json(pagamentos);
  } catch (error) {
    console.error("❌ Erro ao buscar pagamentos:", error);
    res.status(500).json({ error: "Erro ao buscar pagamentos" });
  }
};

/**
 * 🔹 Cria um pagamento
 */
export const createPagamento = async (req: Request, res: Response) => {
  const { valor, metodo, status, consultaId } = req.body;

  try {
    const pagamento = await prisma.pagamento.create({
      data: { valor, metodo, status, consultaId },
    });
    res.status(201).json(pagamento);
  } catch (error) {
    console.error("❌ Erro ao criar pagamento:", error);
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
};
