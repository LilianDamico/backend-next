import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ==========================================================
// 🔒 Função auxiliar para extrair usuário do token JWT
// ==========================================================
function getUserFromToken(req: Request): { id: string; role?: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET || "secret";
    const decoded = jwt.verify(token, secret) as any;
    return { id: decoded.id as string, role: decoded.role };
  } catch {
    return null;
  }
}

// ==========================================================
// 🧩 1️⃣ Criar novo usuário (CLIENTE ou PROFISSIONAL)
// ==========================================================
export async function criarUsuario(req: Request, res: Response) {
  try {
    const {
      nome,
      email,
      senha,
      cpf,
      telefone,
      endereco,
      tipo,
      especialidade,
      cidade,
      bio,
    } = req.body;

    if (!nome || !email || !senha || !cpf || !tipo) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        cpf,
        telefone,
        endereco,
        tipo,
        especialidade,
        cidade,
        bio,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        especialidade: true,
        cidade: true,
        criadoEm: true,
      },
    });

    return res.status(201).json(novoUsuario);
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return res.status(400).json({ error: "E-mail já cadastrado." });
    }
    if (error.code === "P2002" && error.meta?.target?.includes("cpf")) {
      return res.status(400).json({ error: "CPF já cadastrado." });
    }

    console.error("Erro ao criar usuário:", error);
    return res.status(500).json({ error: "Erro interno ao criar usuário." });
  }
}

// ==========================================================
// 🧾 2️⃣ Listar todos os usuários
// ==========================================================
export async function listarUsuarios(req: Request, res: Response) {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        especialidade: true,
        cidade: true,
        criadoEm: true,
      },
      orderBy: { nome: "asc" },
    });

    return res.json(usuarios);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return res.status(500).json({ error: "Erro ao listar usuários." });
  }
}

// ==========================================================
// 👨‍⚕️ 3️⃣ Listar somente profissionais públicos (para landing page)
// ==========================================================
export async function listarProfissionaisPublicos(req: Request, res: Response) {
  try {
    const profissionais = await prisma.user.findMany({
      where: { tipo: "PROFISSIONAL" },
      select: {
        id: true,
        nome: true,
        especialidade: true,
        cidade: true,
      },
      orderBy: { nome: "asc" },
    });

    if (!profissionais.length) {
      return res.status(404).json({ error: "Nenhum profissional encontrado." });
    }

    return res.json(profissionais);
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);
    return res.status(500).json({ error: "Erro ao buscar profissionais." });
  }
}

// ==========================================================
// 🕵️ 4️⃣ Buscar usuário por ID
// ==========================================================
export async function buscarUsuarioPorId(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const usuario = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        especialidade: true,
        cidade: true,
        telefone: true,
        endereco: true,
        bio: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    return res.json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ error: "Erro ao buscar usuário." });
  }
}

// ==========================================================
// 🧩 5️⃣ Atualizar usuário (cliente ou profissional)
// ==========================================================
export async function atualizarUsuario(req: Request, res: Response) {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: "Token inválido." });

  const { nome, telefone, endereco, especialidade, cidade, bio } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { nome, telefone, endereco, especialidade, cidade, bio },
      select: {
        id: true,
        nome: true,
        telefone: true,
        endereco: true,
        especialidade: true,
        cidade: true,
        bio: true,
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return res.status(500).json({ error: "Erro ao atualizar usuário." });
  }
}

// ==========================================================
// 🗑️ 6️⃣ Deletar usuário
// ==========================================================
export async function deletarUsuario(req: Request, res: Response) {
  const { id } = req.params;

  try {
    await prisma.user.delete({ where: { id } });
    return res.json({ message: "Usuário excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return res.status(500).json({ error: "Erro ao deletar usuário." });
  }
}

