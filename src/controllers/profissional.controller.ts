import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";

// =========================================================
//  🔐 FUNÇÃO AUXILIAR PARA PEGAR O USUÁRIO DO TOKEN
// =========================================================
function getUserFromToken(req: Request): { id: string; role?: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET || "secret";
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return { id: decoded.id as string, role: decoded.role as string | undefined };
  } catch (err) {
    console.error("Erro ao decodificar token:", err);
    return null;
  }
}

// =========================================================
//  1️⃣ PERFIL DO PROFISSIONAL LOGADO
// =========================================================
export async function getPerfilProfissional(req: Request, res: Response) {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: "Token inválido" });

  try {
    const profissional = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        especialidade: true,
        bio: true,
        telefone: true,
        cidade: true,
        endereco: true,
      },
    });
    return res.json(profissional);
  } catch (error) {
    console.error("Erro getPerfilProfissional:", error);
    return res.status(500).json({ error: "Erro ao buscar perfil" });
  }
}

// =========================================================
//  2️⃣ ATUALIZAR PERFIL DO PROFISSIONAL
// =========================================================
export async function atualizarPerfilProfissional(req: Request, res: Response) {
  const user = getUserFromToken(req);
  if (!user || user.role !== "PROFISSIONAL") {
    return res.status(403).json({ error: "Acesso negado" });
  }

  const { nome, especialidade, bio, telefone, cidade, endereco } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { nome, especialidade, bio, telefone, cidade, endereco },
      select: {
        id: true,
        nome: true,
        especialidade: true,
        bio: true,
        telefone: true,
        cidade: true,
        endereco: true,
      },
    });
    return res.json(updated);
  } catch (error) {
    console.error("Erro atualizarPerfilProfissional:", error);
    return res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
}

// =========================================================
//  3️⃣ LISTAR TODOS OS PROFISSIONAIS CADASTRADOS (PÚBLICO)
// =========================================================
export async function listarProfissionaisPublicos(req: Request, res: Response) {
  try {
    const profissionais = await prisma.user.findMany({
      where: { tipo: "PROFISSIONAL" },
      select: {
        id: true,
        nome: true,
        especialidade: true,
        cidade: true,
        bio: true,
      },
      orderBy: { nome: "asc" },
    });

    return res.json(profissionais);
  } catch (error) {
    console.error("Erro listarProfissionaisPublicos:", error);
    return res.status(500).json({ error: "Erro ao listar profissionais" });
  }
}

// =========================================================
//  4️⃣ LISTAR HORÁRIOS DO PROFISSIONAL LOGADO
// =========================================================
export async function listarHorariosDoProfissional(req: Request, res: Response) {
  const user = getUserFromToken(req);
  if (!user || user.role !== "PROFISSIONAL") {
    return res.status(403).json({ error: "Acesso negado" });
  }

  try {
    const horarios = await prisma.horario.findMany({
      where: { profissionalId: user.id },
      orderBy: { dataHora: "asc" },
    });
    return res.json(horarios);
  } catch (error) {
    console.error("Erro listarHorariosDoProfissional:", error);
    return res.status(500).json({ error: "Erro ao buscar horários" });
  }
}

// =========================================================
//  5️⃣ CRIAR OU ATUALIZAR HORÁRIO
// =========================================================
export async function criarOuAtualizarHorario(req: Request, res: Response) {
  const user = getUserFromToken(req);
  if (!user || user.role !== "PROFISSIONAL") {
    return res.status(403).json({ error: "Acesso negado" });
  }

  const { dataHora, disponivel } = req.body;
  if (!dataHora) return res.status(400).json({ error: "dataHora é obrigatório" });

  try {
    const existente = await prisma.horario.findFirst({
      where: { profissionalId: user.id, dataHora: new Date(dataHora) },
    });

    const horario = existente
      ? await prisma.horario.update({
          where: { id: existente.id },
          data: { disponivel },
        })
      : await prisma.horario.create({
          data: { profissionalId: user.id, dataHora: new Date(dataHora), disponivel },
        });

    return res.status(200).json(horario);
  } catch (error) {
    console.error("Erro criarOuAtualizarHorario:", error);
    return res.status(500).json({ error: "Erro ao salvar horário" });
  }
}

// =========================================================
//  6️⃣ LISTAR CONSULTAS AGENDADAS (VISÃO PROFISSIONAL)
// =========================================================
export async function listarConsultasAgendadas(req: Request, res: Response) {
  const user = getUserFromToken(req);
  if (!user || user.role !== "PROFISSIONAL") {
    return res.status(403).json({ error: "Acesso negado" });
  }

  try {
    const consultas = await prisma.consulta.findMany({
      where: { profissionalId: user.id },
      include: {
        cliente: { select: { nome: true, email: true } },
        horario: { select: { dataHora: true } },
      },
      orderBy: { data: "asc" },
    });
    return res.json(consultas);
  } catch (error) {
    console.error("Erro listarConsultasAgendadas:", error);
    return res.status(500).json({ error: "Erro ao buscar consultas" });
  }
}
