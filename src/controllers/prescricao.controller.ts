import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/* ========================================================
   POST → Criar prescrição
======================================================== */
export async function criarPrescricao(req: Request, res: Response) {
  try {
    const { conteudo, tipo, profissionalNome, pacienteNome, consultaId } = req.body;

    if (!conteudo || !tipo || !profissionalNome || !pacienteNome || !consultaId)
      return res.status(400).json({ error: "Dados incompletos." });

    // Busca IDs pelo nome
    const profissional = await prisma.user.findFirst({
      where: { nome: { equals: profissionalNome, mode: "insensitive" } }
    });
    const paciente = await prisma.user.findFirst({
      where: { nome: { equals: pacienteNome, mode: "insensitive" } }
    });

    if (!profissional || !paciente)
      return res.status(404).json({ error: "Profissional ou paciente não encontrado." });

    const nova = await prisma.prescricao.create({
      data: {
        conteudo,
        tipo,
        profissionalId: profissional.id,
        pacienteId: paciente.id,
        consultaId
      }
    });

    return res.status(201).json({ message: "Prescrição criada com sucesso!", nova });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar prescrição." });
  }
}

/* ========================================================
   GET por NOME do PACIENTE 
======================================================== */
export async function listarPrescricoesPorNomePaciente(req: Request, res: Response) {
  try {
    const { nome } = req.params;

    const paciente = await prisma.user.findFirst({
      where: { nome: { equals: nome, mode: "insensitive" } }
    });

    if (!paciente) return res.status(404).json({ error: "Paciente não encontrado." });

    const lista = await prisma.prescricao.findMany({
      where: { pacienteId: paciente.id },
      include: { consulta: true }
    });

    res.json(lista);

  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar prescrições pelo nome do paciente" });
  }
}

/* ========================================================
   GET por NOME do PROFISSIONAL 
======================================================== */
export async function listarPrescricoesPorNomeProfissional(req: Request, res: Response) {
  try {
    const { nome } = req.params;

    const profissional = await prisma.user.findFirst({
      where: { nome: { equals: nome, mode: "insensitive" } }
    });

    if (!profissional) return res.status(404).json({ error: "Profissional não encontrado." });

    const lista = await prisma.prescricao.findMany({
      where: { profissionalId: profissional.id },
      include: { consulta: true, paciente: true }
    });

    res.json(lista);

  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar prescrições pelo nome do profissional" });
  }
}
