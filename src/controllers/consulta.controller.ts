import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";

// ============================================================
// 🔐 Função auxiliar para extrair usuário do token
// ============================================================
function getUserFromToken(req: Request): { id: string; role?: string; nome?: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const secret: string = process.env.JWT_SECRET ?? "secret";
    const decoded = jwt.verify(token as string, secret) as JwtPayload;

    return {
      id: decoded.id as string,
      role: decoded.role as string | undefined,
      nome: decoded.nome as string | undefined,
    };
  } catch (err) {
    console.error("❌ Erro ao decodificar token:", err);
    return null;
  }
}

// ============================================================
// 🔹 CLIENTE - Criar nova consulta
// ============================================================
export async function criarConsulta(req: Request, res: Response) {
  const { clienteNome, profissionalNome, dataHora } = req.body;

  if (!clienteNome || !profissionalNome || !dataHora) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  try {
    const cliente = await prisma.user.findFirst({
      where: { nome: { equals: clienteNome, mode: "insensitive" }, tipo: "CLIENTE" },
    });

    const profissional = await prisma.user.findFirst({
      where: { nome: { equals: profissionalNome, mode: "insensitive" }, tipo: "PROFISSIONAL" },
    });

    if (!cliente || !profissional) {
      return res.status(404).json({ error: "Cliente ou profissional não encontrado." });
    }

    const horario = await prisma.horario.findFirst({
      where: {
        profissionalId: profissional.id,
        dataHora: new Date(dataHora),
        disponivel: true,
      },
    });

    if (!horario) {
      return res.status(400).json({ error: "Horário indisponível." });
    }

    const consulta = await prisma.consulta.create({
      data: {
        dataHora: new Date(dataHora),
        clienteId: cliente.id,
        profissionalId: profissional.id,
        horarioId: horario.id,
        status: "AGENDADA",
      },
      include: {
        cliente: { select: { nome: true } },
        profissional: { select: { nome: true, especialidade: true } },
        horario: { select: { dataHora: true } },
      },
    });

    await prisma.horario.update({
      where: { id: horario.id },
      data: { disponivel: false },
    });

    return res.status(201).json({
      message: "Consulta agendada com sucesso.",
      consulta,
    });
  } catch (error) {
    console.error("❌ Erro ao criar consulta:", error);
    return res.status(500).json({ error: "Erro ao agendar consulta." });
  }
}

// ============================================================
// 🔹 CLIENTE - Listar consultas do cliente logado
// ============================================================
export async function listarConsultasDoCliente(req: Request, res: Response) {
  const user = getUserFromToken(req);
  if (!user || user.role !== "CLIENTE") {
    return res.status(403).json({ error: "Acesso negado." });
  }

  try {
    const consultas = await prisma.consulta.findMany({
      where: { clienteId: user.id },
      include: {
        profissional: { select: { nome: true, especialidade: true } },
        horario: { select: { dataHora: true } },
      },
      orderBy: { dataHora: "asc" },
    });

    return res.json(consultas);
  } catch (error) {
    console.error("❌ Erro ao listar consultas do cliente:", error);
    return res.status(500).json({ error: "Erro ao carregar consultas." });
  }
}

// ============================================================
// 🔹 PROFISSIONAL - Listar consultas agendadas com ele
// ============================================================
export async function listarConsultasDoProfissional(req: Request, res: Response) {
  const user = getUserFromToken(req);
  if (!user || user.role !== "PROFISSIONAL") {
    return res.status(403).json({ error: "Acesso negado." });
  }

  try {
    const consultas = await prisma.consulta.findMany({
      where: { profissionalId: user.id },
      include: {
        cliente: { select: { nome: true, email: true } },
        horario: { select: { dataHora: true } },
      },
      orderBy: { dataHora: "asc" },
    });

    return res.json(consultas);
  } catch (error) {
    console.error("❌ Erro ao listar consultas do profissional:", error);
    return res.status(500).json({ error: "Erro ao carregar consultas." });
  }
}

// ============================================================
// 🔹 CLIENTE - Cancelar consulta
// ============================================================
export async function cancelarConsulta(req: Request, res: Response) {
  const user = getUserFromToken(req);
  if (!user || user.role !== "CLIENTE") {
    return res.status(403).json({ error: "Acesso negado." });
  }

  const { id } = req.params;

  try {
    const consulta = await prisma.consulta.findUnique({
      where: { id },
    });

    if (!consulta) {
      return res.status(404).json({ error: "Consulta não encontrada." });
    }

    if (!consulta.horarioId) {
      return res.status(400).json({ error: "Consulta sem horário vinculado." });
    }

    await prisma.consulta.update({
      where: { id },
      data: { status: "CANCELADA" },
    });

    await prisma.horario.update({
      where: { id: consulta.horarioId },
      data: { disponivel: true },
    });

    return res.json({ message: "Consulta cancelada com sucesso." });
  } catch (error) {
    console.error("❌ Erro ao cancelar consulta:", error);
    return res.status(500).json({ error: "Erro ao cancelar consulta." });
  }
}

export async function listarConsultasPorClienteNome(req: Request, res: Response) {
  try {
    const { userNome } = req.params;

    const user = await prisma.user.findFirst({
      where: { nome: { equals: userNome, mode: "insensitive" } },
    });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const consultas = await prisma.consulta.findMany({
      where: { clienteId: user.id },
      include: {
        profissional: true,
        clinica: true,
        horario: true
      },
      orderBy: { dataHora: "asc" },
    });

    return res.json(consultas);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar consultas" });
  }
}


export async function listarConsultasPorNomeCliente(req: Request, res: Response) {
  try {
    const { userNome } = req.params;

    const cliente = await prisma.user.findFirst({
      where: { nome: { equals: userNome, mode: "insensitive" } }
    });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    const consultas = await prisma.consulta.findMany({
      where: { clienteId: cliente.id },
      include: {
        profissional: true,
        clinica: true,
        horario: true,
      },
      orderBy: { dataHora: "asc" },
    });

    res.json(consultas);
  } catch (error) {
    console.error("Erro ao listar consultas por nome do cliente:", error);
    res.status(500).json({ error: "Erro ao buscar consultas." });
  }
}

