// ===============================================================
//  CONTROLLER DE CONSULTAS — MINDCARE 2025
// ===============================================================

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";
import { differenceInHours } from "date-fns";

// ===============================================================
// FUNÇÃO PARA EXTRAIR USUÁRIO DO TOKEN
// ===============================================================
interface TokenUser {
  id: string;
  tipo?: string;
  nome?: string;
}

function getUserFromToken(req: Request): TokenUser | null {
  const auth = req.headers.authorization;
  if (!auth) return null;

  const token = auth.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ?? "supersecreto"
    ) as JwtPayload;

    return {
      id: decoded.id as string,
      tipo: decoded.tipo as string,
      nome: decoded.nome as string,
    };
  } catch {
    return null;
  }
}

// ===============================================================
// 1) AGENDAR CONSULTA (CLIENTE)
// ===============================================================
// BODY esperado: { clienteNome, profissionalNome, horarioId }
export async function criarConsulta(req: Request, res: Response) {
  const { clienteNome, profissionalNome, horarioId } = req.body;

  if (!clienteNome || !profissionalNome || !horarioId)
    return res.status(400).json({ error: "Dados obrigatórios ausentes." });

  try {
    const cliente = await prisma.user.findFirst({
      where: {
        nome: { equals: clienteNome, mode: "insensitive" },
        tipo: "CLIENTE",
      },
    });

    const profissional = await prisma.user.findFirst({
      where: {
        nome: { equals: profissionalNome, mode: "insensitive" },
        tipo: "PROFISSIONAL",
      },
    });

    if (!cliente || !profissional)
      return res
        .status(404)
        .json({ error: "Cliente ou profissional não localizado." });

    const horario = await prisma.calendarioProfissional.findUnique({
      where: { id: horarioId },
    });

    if (!horario)
      return res.status(404).json({ error: "Horário não encontrado." });

    if (!horario.disponivel)
      return res.status(409).json({ error: "Horário indisponível." });

    const consulta = await prisma.consulta.create({
      data: {
        profissionalId: profissional.id,
        clienteId: cliente.id,
        horarioId,
        dataHora: horario.dataHora,
        status: "AGENDADA",
      },
      include: { cliente: true, profissional: true, horario: true },
    });

    await prisma.calendarioProfissional.update({
      where: { id: horarioId },
      data: { disponivel: false },
    });

    return res
      .status(201)
      .json({ message: "Consulta agendada com sucesso!", consulta });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao criar consulta." });
  }
}

// ===============================================================
// 2) LISTAR CONSULTAS DO CLIENTE (TOKEN)
// ===============================================================
export async function listarConsultasDoCliente(req: Request, res: Response) {
  const user = getUserFromToken(req);
  if (!user || user.tipo !== "CLIENTE")
    return res.status(403).json({ error: "Acesso negado." });

  try {
    const consultas = await prisma.consulta.findMany({
      where: { clienteId: user.id },
      include: {
        profissional: true,
        horario: true,
        // 🔥 aqui vem a info pra saber se já foi avaliada
        avaliacoes: {
          select: { id: true },
        },
      },
      orderBy: { dataHora: "asc" },
    });

    return res.json(consultas);
  } catch {
    return res.status(500).json({ error: "Erro ao buscar consultas." });
  }
}

// ===============================================================
// 3) LISTAR CONSULTAS DO PROFISSIONAL (TOKEN) 🔥
// ===============================================================
export async function listarConsultasDoProfissional(req: Request, res: Response) {
  const user = getUserFromToken(req);

  if (!user || user.tipo !== "PROFISSIONAL")
    return res.status(403).json({ error: "Acesso negado." });

  try {
    const consultas = await prisma.consulta.findMany({
      where: { profissionalId: user.id }, // token resolve tudo
      include: {
        cliente: { select: { nome: true } },
        horario: true,
        // também traz avaliacoes, útil pro painel do profissional
        avaliacoes: {
          select: { id: true, nota: true },
        },
      },
      orderBy: { dataHora: "asc" },
    });

    return res.json(consultas);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar consultas." });
  }
}

// ===============================================================
// 4) BUSCAR CONSULTAS POR NOME DO CLIENTE
// ===============================================================
export async function listarConsultasPorClienteNome(req: Request, res: Response) {
  const { userNome } = req.params;

  if (!userNome)
    return res.status(400).json({ error: "Nome do cliente é obrigatório." });

  try {
    const cliente = await prisma.user.findFirst({
      where: {
        nome: { equals: userNome, mode: "insensitive" },
        tipo: "CLIENTE",
      },
    });

    if (!cliente)
      return res.status(404).json({ error: "Cliente não encontrado." });

    const consultas = await prisma.consulta.findMany({
      where: { clienteId: cliente.id },
      include: {
        profissional: true,
        horario: true,
        avaliacoes: {
          select: { id: true },
        },
      },
      orderBy: { dataHora: "asc" },
    });

    res.json(consultas);
  } catch {
    res.status(500).json({ error: "Erro ao buscar consultas." });
  }
}

// ===============================================================
// 5) CANCELAR CONSULTA (CLIENTE)
// ===============================================================
export async function cancelarConsulta(req: Request, res: Response) {
  const user = getUserFromToken(req);
  if (!user || user.tipo !== "CLIENTE")
    return res.status(403).json({ error: "Acesso negado." });

  const { id } = req.params;

  try {
    const consulta = await prisma.consulta.findUnique({
      where: { id },
      include: { horario: true },
    });

    if (!consulta)
      return res.status(404).json({ error: "Consulta não encontrada." });
    if (consulta.clienteId !== user.id)
      return res.status(403).json({ error: "Você não pode cancelar essa consulta." });

    const horas = differenceInHours(consulta.dataHora, new Date());
    if (horas < 24)
      return res
        .status(400)
        .json({ error: "Cancelamento permitido somente com 24h de antecedência." });

    await prisma.consulta.update({
      where: { id },
      data: { status: "CANCELADA", canceladaPor: "CLIENTE" },
    });

    await prisma.calendarioProfissional.update({
      where: { id: consulta.horarioId },
      data: { disponivel: true },
    });

    return res.json({ message: "Consulta cancelada com sucesso." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao cancelar consulta." });
  }
}
