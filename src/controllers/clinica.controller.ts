import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getClinicas = async (req: Request, res: Response) => {
  try {
    const clinicas = await prisma.clinica.findMany({
      include: { consultas: true },
    });
    res.json(clinicas);
  } catch (error) {
    console.error("❌ Erro ao buscar clínicas:", error);
    res.status(500).json({ error: "Erro ao buscar clínicas" });
  }
};

export const createClinica = async (req: Request, res: Response) => {
  const { nome, endereco, telefone } = req.body;

  try {
    const clinica = await prisma.clinica.create({
      data: { nome, endereco, telefone },
    });
    res.status(201).json(clinica);
  } catch (error) {
    console.error("❌ Erro ao criar clínica:", error);
    res.status(500).json({ error: "Erro ao criar clínica" });
  }
};
