import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import bcrypt from "bcryptjs";
import {
  criarUsuario,
  listarUsuarios,
  listarProfissionaisPublicos,
  buscarUsuarioPorId,
  deletarUsuario,
} from "../../controllers/user.controller.js";
import { mockReq, mockRes } from "../helpers/mockHttp.js";
// @ts-expect-error resolvido pelo moduleNameMapper do Jest
import { prisma } from "../lib/prisma.js";

jest.mock("../lib/prisma");
jest.mock("bcryptjs", () => ({
  hash: jest.fn(async () => "hashed-password"),
}));

const mockUser = prisma.user as jest.Mocked<typeof prisma.user>;

describe("user.controller", () => {
  describe("criarUsuario", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("deve retornar 400 quando campos obrigatórios estão faltando", async () => {
      const req = mockReq({ body: { nome: "Maria", email: "maria@email.com" } });
      const res = mockRes();

      await criarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Campos obrigatórios ausentes.",
      });
    });

    it("deve retornar 400 quando o e-mail já estiver cadastrado", async () => {
      const req = mockReq({
        body: {
          nome: "Maria",
          email: "maria@email.com",
          senha: "123456",
          cpf: "12345678900",
          tipo: "CLIENTE",
        },
      });
      const res = mockRes();

      (mockUser.create as any).mockRejectedValue({
        code: "P2002",
        meta: { target: ["email"] },
      });

      await criarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "E-mail já cadastrado." });
    });

    it("deve retornar 400 quando o cpf já estiver cadastrado", async () => {
      const req = mockReq({
        body: {
          nome: "Maria",
          email: "maria@email.com",
          senha: "123456",
          cpf: "12345678900",
          tipo: "CLIENTE",
        },
      });
      const res = mockRes();

      (mockUser.create as any).mockRejectedValue({
        code: "P2002",
        meta: { target: ["cpf"] },
      });

      await criarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "CPF já cadastrado." });
    });

    it("deve retornar 201 quando o usuário for criado com sucesso", async () => {
      const req = mockReq({
        body: {
          nome: "Maria",
          email: "maria@email.com",
          senha: "123456",
          cpf: "12345678900",
          telefone: "11999999999",
          endereco: "Rua 1",
          tipo: "PROFISSIONAL",
          especialidade: "Psicologia",
          cidade: "São Paulo",
          bio: "Bio",
        },
      });
      const res = mockRes();
      const novoUsuario = {
        id: "user-1",
        nome: "Maria",
        email: "maria@email.com",
        tipo: "PROFISSIONAL",
        especialidade: "Psicologia",
        cidade: "São Paulo",
        criadoEm: new Date("2026-06-21T08:00:00.000Z"),
      };

      (mockUser.create as any).mockResolvedValue(novoUsuario);

      await criarUsuario(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
      expect(mockUser.create).toHaveBeenCalledWith({
        data: {
          nome: "Maria",
          email: "maria@email.com",
          senha: "hashed-password",
          cpf: "12345678900",
          telefone: "11999999999",
          endereco: "Rua 1",
          tipo: "PROFISSIONAL",
          especialidade: "Psicologia",
          cidade: "São Paulo",
          bio: "Bio",
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
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(novoUsuario);
    });
  });

  describe("listarUsuarios", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("deve retornar 200 com a lista de usuários", async () => {
      const req = mockReq();
      const res = mockRes();
      const usuarios = [{ id: "1", nome: "Maria" }];

      (mockUser.findMany as any).mockResolvedValue(usuarios);

      await listarUsuarios(req, res);

      expect(mockUser.findMany).toHaveBeenCalledWith({
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
      expect((res.status as jest.Mock).mock.calls[0]?.[0] ?? 200).toBe(200);
      expect(res.json).toHaveBeenCalledWith(usuarios);
    });

    it("deve retornar 500 quando ocorrer erro ao listar usuários", async () => {
      const req = mockReq();
      const res = mockRes();

      (mockUser.findMany as any).mockRejectedValue(new Error("falha"));

      await listarUsuarios(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Erro ao listar usuários." });
    });
  });

  describe("listarProfissionaisPublicos", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("deve retornar 404 quando não houver profissionais", async () => {
      const req = mockReq();
      const res = mockRes();

      (mockUser.findMany as any).mockResolvedValue([]);

      await listarProfissionaisPublicos(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Nenhum profissional encontrado.",
      });
    });

    it("deve retornar 200 com os profissionais públicos", async () => {
      const req = mockReq();
      const res = mockRes();
      const profissionais = [{ id: "prof-1", nome: "Maria", especialidade: "Psi", cidade: "SP" }];

      (mockUser.findMany as any).mockResolvedValue(profissionais);

      await listarProfissionaisPublicos(req, res);

      expect(mockUser.findMany).toHaveBeenCalledWith({
        where: { tipo: "PROFISSIONAL" },
        select: {
          id: true,
          nome: true,
          especialidade: true,
          cidade: true,
        },
        orderBy: { nome: "asc" },
      });
      expect((res.status as jest.Mock).mock.calls[0]?.[0] ?? 200).toBe(200);
      expect(res.json).toHaveBeenCalledWith(profissionais);
    });
  });

  describe("buscarUsuarioPorId", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("deve retornar 404 quando o usuário não for encontrado", async () => {
      const req = mockReq({ params: { id: "user-1" } });
      const res = mockRes();

      (mockUser.findUnique as any).mockResolvedValue(null);

      await buscarUsuarioPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Usuário não encontrado." });
    });

    it("deve retornar 200 quando o usuário for encontrado", async () => {
      const req = mockReq({ params: { id: "user-1" } });
      const res = mockRes();
      const usuario = {
        id: "user-1",
        nome: "Maria",
        email: "maria@email.com",
        tipo: "CLIENTE",
        especialidade: null,
        cidade: "SP",
        telefone: "11999999999",
        endereco: "Rua 1",
        bio: "Bio",
      };

      (mockUser.findUnique as any).mockResolvedValue(usuario);

      await buscarUsuarioPorId(req, res);

      expect(mockUser.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
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
      expect((res.status as jest.Mock).mock.calls[0]?.[0] ?? 200).toBe(200);
      expect(res.json).toHaveBeenCalledWith(usuario);
    });
  });

  describe("deletarUsuario", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("deve retornar 200 quando o usuário for desativado com sucesso (soft delete)", async () => {
      const req = mockReq({ params: { id: "user-1" } });
      const res = mockRes();

      (mockUser.update as any).mockResolvedValue({ id: "user-1", deletado: true });

      await deletarUsuario(req, res);

      expect(mockUser.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { deletado: true },
      });
      expect((res.status as jest.Mock).mock.calls[0]?.[0] ?? 200).toBe(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuário desativado com sucesso.",
      });
    });

    it("deve retornar 500 quando ocorrer erro ao deletar usuário", async () => {
      const req = mockReq({ params: { id: "user-1" } });
      const res = mockRes();

      (mockUser.update as any).mockRejectedValue(new Error("falha"));

      await deletarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Erro ao deletar usuário." });
    });
  });
});
