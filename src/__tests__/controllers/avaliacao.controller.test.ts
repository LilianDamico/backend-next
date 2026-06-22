import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { criarAvaliacao } from "../../controllers/avaliacao.controller.js";
import { mockReq, mockRes } from "../helpers/mockHttp.js";
// @ts-expect-error resolvido pelo moduleNameMapper do Jest
import { prisma } from "../lib/prisma.js";

jest.mock("../lib/prisma");

const mockConsulta = prisma.consulta as jest.Mocked<typeof prisma.consulta>;
const mockAvaliacao = prisma.avaliacao as jest.Mocked<typeof prisma.avaliacao>;

describe("avaliacao.controller", () => {
  describe("criarAvaliacao", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("deve retornar 400 quando consultaId ou nota estiverem faltando", async () => {
      const req = mockReq({
        body: { consultaId: "", nota: undefined },
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();

      await criarAvaliacao(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "ConsultaId e nota são obrigatórios.",
      });
    });

    it("deve retornar 404 quando a consulta não for encontrada", async () => {
      const req = mockReq({
        body: { consultaId: "consulta-1", nota: 5 },
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();

      (mockConsulta.findUnique as any).mockResolvedValue(null);

      await criarAvaliacao(req, res);

      expect(mockConsulta.findUnique).toHaveBeenCalledWith({
        where: { id: "consulta-1" },
        include: { cliente: true },
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Consulta não encontrada." });
    });

    it("deve retornar 403 quando a consulta não pertencer ao usuário", async () => {
      const req = mockReq({
        body: { consultaId: "consulta-1", nota: 5 },
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();

      (mockConsulta.findUnique as any).mockResolvedValue({
        id: "consulta-1",
        clienteId: "cliente-2",
        cliente: { id: "cliente-2" },
      });

      await criarAvaliacao(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Você não pode avaliar esta consulta.",
      });
    });

    it("deve retornar 400 quando a consulta já tiver sido avaliada", async () => {
      const req = mockReq({
        body: { consultaId: "consulta-1", nota: 5 },
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();

      (mockConsulta.findUnique as any).mockResolvedValue({
        id: "consulta-1",
        clienteId: "cliente-1",
        cliente: { id: "cliente-1" },
      });
      (mockAvaliacao.findFirst as any).mockResolvedValue({ id: "aval-1" });

      await criarAvaliacao(req, res);

      expect(mockAvaliacao.findFirst).toHaveBeenCalledWith({
        where: { consultaId: "consulta-1" },
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Esta consulta já foi avaliada.",
      });
    });

    it("deve retornar 200 com a avaliação criada com sucesso", async () => {
      const req = mockReq({
        body: { consultaId: "consulta-1", nota: 5, comentario: "Ótimo atendimento" },
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();
      const avaliacao = {
        id: "aval-1",
        consultaId: "consulta-1",
        nota: 5,
        comentario: "Ótimo atendimento",
      };

      (mockConsulta.findUnique as any).mockResolvedValue({
        id: "consulta-1",
        clienteId: "cliente-1",
        cliente: { id: "cliente-1" },
      });
      (mockAvaliacao.findFirst as any).mockResolvedValue(null);
      (mockAvaliacao.create as any).mockResolvedValue(avaliacao);

      await criarAvaliacao(req, res);

      expect(mockAvaliacao.create).toHaveBeenCalledWith({
        data: {
          consultaId: "consulta-1",
          nota: 5,
          comentario: "Ótimo atendimento",
        },
      });
      expect((res.status as jest.Mock).mock.calls[0]?.[0] ?? 200).toBe(200);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: true,
        avaliacao,
      });
    });

    it("deve retornar 500 quando ocorrer erro interno", async () => {
      const req = mockReq({
        body: { consultaId: "consulta-1", nota: 5 },
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();

      (mockConsulta.findUnique as any).mockRejectedValue(new Error("falha interna"));

      await criarAvaliacao(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro interno ao registrar avaliação.",
        detalhes: "falha interna",
      });
    });
  });
});
