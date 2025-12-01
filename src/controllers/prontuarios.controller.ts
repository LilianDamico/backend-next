import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listarPorUsuario = async (req: Request, res: Response) => {
  try {
    const nome = req.params.nome; // veio na URL
    if (!nome) return res.status(400).json({ error: "Nome não informado" });

    const prontuarios = await prisma.prontuario.findMany({
      where: {
        consulta: {
          OR: [
            { cliente: { nome: { contains: nome, mode: "insensitive" } }},
            { profissional: { nome: { contains: nome, mode: "insensitive" } }}
          ]
        }
      },
      include: {
        consulta: {
          include: {
            cliente: true,
            profissional: true,
          }
        }
      },
      orderBy: { criadoEm: "desc" }
    });

    return res.json(prontuarios);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao buscar prontuários" });
  }
};
