import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
      data: { nome, email, cpf, senha: senhaHash, tipo },
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

    const token = jwt.sign(
      { id: user.id, email: user.email, cpf: user.cpf, tipo: user.tipo },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    );

    return res.status(200).json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo },
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
    const userData = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, nome: true, email: true, cpf: true, tipo: true },
    });

    if (!userData) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    return res.json(userData);
  } catch (error: any) {
    console.error("❌ Erro ao buscar perfil:", error);
    return res.status(500).json({ error: "Erro ao buscar perfil." });
  }
};
