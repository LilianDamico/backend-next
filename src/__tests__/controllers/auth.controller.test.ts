import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { register, login, getProfile } from "../../controllers/auth.controller.js";
import { mockReq, mockRes } from "../helpers/mockHttp.js";
// @ts-expect-error resolvido pelo moduleNameMapper do Jest
import { prisma } from "../lib/prisma.js";

jest.mock("../lib/prisma");
jest.mock("bcrypt", () => ({
  hash: jest.fn(async () => "hashed"),
  compare: jest.fn(),
}));
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mocked-token"),
  verify: jest.fn(),
}));

const mockUser = prisma.user as jest.Mocked<typeof prisma.user>;

describe("auth.controller", () => {
  describe("register", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      process.env.JWT_SECRET = "test-secret";
    });

    it("deve retornar 400 quando campos estão faltando", async () => {
      const req = mockReq({ body: { nome: "Maria", email: "maria@email.com" } });
      const res = mockRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Campos obrigatórios: nome, email, cpf, senha e tipo.",
      });
    });

    it("deve retornar 400 quando o tipo é inválido", async () => {
      const req = mockReq({
        body: {
          nome: "Maria",
          email: "maria@email.com",
          cpf: "12345678900",
          senha: "123456",
          tipo: "ADMIN",
        },
      });
      const res = mockRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Tipo inválido." });
    });

    it("deve retornar 409 quando já existe usuário com email ou cpf", async () => {
      const req = mockReq({
        body: {
          nome: "Maria",
          email: "maria@email.com",
          cpf: "12345678900",
          senha: "123456",
          tipo: "CLIENTE",
        },
      });
      const res = mockRes();

      (mockUser.findFirst as any).mockResolvedValue({ id: "user-1" });

      await register(req, res);

      expect(mockUser.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ email: "maria@email.com" }, { cpf: "12345678900" }] },
      });
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "Usuário já cadastrado com este email ou CPF.",
      });
    });

    it("deve retornar 201 quando o registro for realizado com sucesso", async () => {
      const req = mockReq({
        body: {
          nome: "Maria",
          email: "maria@email.com",
          cpf: "12345678900",
          senha: "123456",
          tipo: "CLIENTE",
        },
      });
      const res = mockRes();

      (mockUser.findFirst as any).mockResolvedValue(null);
      (mockUser.create as any).mockResolvedValue({
        id: "user-1",
        nome: "Maria",
        email: "maria@email.com",
        cpf: "12345678900",
        tipo: "CLIENTE",
      });

      await register(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
      expect(mockUser.create).toHaveBeenCalledWith({
        data: {
          nome: "Maria",
          email: "maria@email.com",
          cpf: "12345678900",
          senha: "hashed",
          tipo: "CLIENTE",
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuário registrado com sucesso.",
        user: {
          id: "user-1",
          nome: "Maria",
          email: "maria@email.com",
          cpf: "12345678900",
          tipo: "CLIENTE",
        },
      });
    });

    it("deve retornar 500 quando ocorrer erro interno", async () => {
      const req = mockReq({
        body: {
          nome: "Maria",
          email: "maria@email.com",
          cpf: "12345678900",
          senha: "123456",
          tipo: "CLIENTE",
        },
      });
      const res = mockRes();

      (mockUser.findFirst as any).mockRejectedValue(new Error("falha"));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro interno ao registrar usuário.",
      });
    });
  });

  describe("login", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      process.env.JWT_SECRET = "test-secret";
    });

    it("deve retornar 400 quando login ou senha estão faltando", async () => {
      const req = mockReq({ body: { login: "maria@email.com" } });
      const res = mockRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Login e senha são obrigatórios.",
      });
    });

    it("deve retornar 404 quando o usuário não for encontrado", async () => {
      const req = mockReq({ body: { login: "maria@email.com", senha: "123456" } });
      const res = mockRes();

      (mockUser.findFirst as any).mockResolvedValue(null);

      await login(req, res);

      expect(mockUser.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ email: "maria@email.com" }, { cpf: "maria@email.com" }] },
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Usuário não encontrado." });
    });

    it("deve retornar 401 quando a senha estiver incorreta", async () => {
      const req = mockReq({ body: { login: "maria@email.com", senha: "123456" } });
      const res = mockRes();

      (mockUser.findFirst as any).mockResolvedValue({
        id: "user-1",
        nome: "Maria",
        email: "maria@email.com",
        cpf: "12345678900",
        tipo: "CLIENTE",
        senha: "hashed-password",
      });
      (bcrypt.compare as any).mockResolvedValue(false);

      await login(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith("123456", "hashed-password");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Senha incorreta." });
    });

    it("deve retornar 200 com token e usuário quando o login for bem-sucedido", async () => {
      const req = mockReq({ body: { login: "maria@email.com", senha: "123456" } });
      const res = mockRes();

      (mockUser.findFirst as any).mockResolvedValue({
        id: "user-1",
        nome: "Maria",
        email: "maria@email.com",
        cpf: "12345678900",
        tipo: "CLIENTE",
        senha: "hashed-password",
      });
      (bcrypt.compare as any).mockResolvedValue(true);

      await login(req, res);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: "user-1",
          email: "maria@email.com",
          cpf: "12345678900",
          tipo: "CLIENTE",
        },
        "test-secret",
        { expiresIn: "8h" }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: "mocked-token",
        user: {
          id: "user-1",
          nome: "Maria",
          email: "maria@email.com",
          tipo: "CLIENTE",
        },
      });
    });

    it("deve retornar 500 quando ocorrer erro interno", async () => {
      const req = mockReq({ body: { login: "maria@email.com", senha: "123456" } });
      const res = mockRes();

      (mockUser.findFirst as any).mockRejectedValue(new Error("falha"));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro interno ao fazer login.",
      });
    });
  });

  describe("getProfile", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      process.env.JWT_SECRET = "test-secret";
    });

    it("deve retornar 404 quando o usuário não for encontrado", async () => {
      const req = mockReq({ user: { id: "user-1", email: "a", cpf: "b", tipo: "CLIENTE" } });
      const res = mockRes();

      (mockUser.findUnique as any).mockResolvedValue(null);

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Usuário não encontrado." });
    });

    it("deve retornar 200 com os dados do perfil", async () => {
      const req = mockReq({ user: { id: "user-1", email: "a", cpf: "b", tipo: "CLIENTE" } });
      const res = mockRes();
      const usuario = {
        id: "user-1",
        nome: "Maria",
        email: "maria@email.com",
        cpf: "12345678900",
        tipo: "CLIENTE",
      };

      (mockUser.findUnique as any).mockResolvedValue(usuario);

      await getProfile(req, res);

      expect(mockUser.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
        select: { id: true, nome: true, email: true, cpf: true, tipo: true },
      });
      expect((res.status as jest.Mock).mock.calls[0]?.[0] ?? 200).toBe(200);
      expect(res.json).toHaveBeenCalledWith(usuario);
    });
  });
});
