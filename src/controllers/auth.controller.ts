import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

/**
 * ===========================
 * REGISTRO DE USUÁRIO
 * ===========================
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { nome, email, cpf, senha, tipo } = req.body;

    if (!nome || !email || !cpf || !senha || !tipo) {
      return res.status(400).json({
        error: "Campos obrigatórios: nome, email, cpf, senha e tipo.",
      });
    }

    if (!["CLIENTE", "PROFISSIONAL"].includes(tipo)) {
      return res.status(400).json({ error: "Tipo inválido." });
    }

    // Verifica duplicidade de email ou CPF
    const existente = await prisma.user.findFirst({
      where: { OR: [{ email }, { cpf }] },
    });
    if (existente) {
      return res
        .status(409)
        .json({ error: "Usuário já cadastrado com este email ou CPF." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUser = await prisma.user.create({
      data: {
        nome: nome,
        email,
        cpf,
        senha: senhaHash,
        tipo,
      },
    });

    return res.status(201).json({
      message: "Usuário registrado com sucesso.",
      user: {
        id: novoUser.id,
        nome: novoUser.nome,
        email: novoUser.email,
        cpf: novoUser.cpf,
        tipo: novoUser.tipo,
      },
    });
  } catch (error: any) {
    console.error("❌ Erro no registro:", error);
    return res.status(500).json({ error: "Erro interno ao registrar usuário." });
  }
};

/**
 * ===========================
 * LOGIN DE USUÁRIO
 * ===========================
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { login, senha } = req.body;

    if (!login || !senha) {
      return res.status(400).json({ error: "Login e senha são obrigatórios." });
    }

    // Aceita email ou CPF
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: login }, { cpf: login }] },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    // Gera token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        tipo: user.tipo,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    // ✅ Resposta NO FORMATO EXATO que o frontend precisa
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      }
    });

  } catch (error: any) {
    console.error("❌ Erro no login:", error);
    return res.status(500).json({ error: "Erro interno ao fazer login." });
  }
};


/**
 * ===========================
 * PERFIL DO USUÁRIO (TOKEN)
 * ===========================
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: "Token não fornecido." });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, nome: true, email: true, cpf: true, tipo: true },
    });

    if (!userData) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json(userData);
  } catch (error: any) {
    console.error("❌ Erro ao buscar perfil:", error);
    res.status(500).json({ error: "Erro ao buscar perfil." });
  }
};
