import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  calendarioAtualizar,
  calendarioCriar,
  calendarioExcluir,
  calendarioGerarDia,
  calendarioMe,
} from "../../controllers/calendarioProfissional.controller.js";
import { mockReq, mockRes } from "../helpers/mockHttp.js";
// @ts-expect-error resolvido pelo moduleNameMapper do Jest
import { prisma } from "../lib/prisma.js";

jest.mock("../lib/prisma");

const mockCalendario = prisma.calendarioProfissional as jest.Mocked<
  typeof prisma.calendarioProfissional
>;

describe("calendarioProfissional.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("calendarioMe", () => {
    it("deve retornar os slots do profissional autenticado", async () => {
      const slots = [{ id: "slot-1" }];
      (mockCalendario.findMany as any).mockResolvedValue(slots);
      const req = mockReq({ user: { id: "user-1", tipo: "PROFISSIONAL" } } as any);
      const res = mockRes();

      await calendarioMe(req, res);

      expect(mockCalendario.findMany).toHaveBeenCalledWith({
        where: { profissionalId: "user-1" },
        orderBy: { dataHora: "asc" },
      });
      expect(res.json).toHaveBeenCalledWith({
        profissionalId: "user-1",
        slots,
      });
    });

    it("deve retornar 500 quando ocorrer erro em calendarioMe", async () => {
      (mockCalendario.findMany as any).mockRejectedValue(new Error("falha"));
      const req = mockReq({ user: { id: "user-1", tipo: "PROFISSIONAL" } } as any);
      const res = mockRes();

      await calendarioMe(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Erro interno." });
    });
  });

  describe("calendarioCriar", () => {
    it("deve retornar 409 quando o horário já existir", async () => {
      (mockCalendario.findFirst as any).mockResolvedValue({ id: "slot-1" });
      const req = mockReq({
        user: { id: "user-1", tipo: "PROFISSIONAL" },
        body: { dataHora: "2026-06-21T09:00:00.000Z", observacao: "Teste" },
      } as any);
      const res = mockRes();

      await calendarioCriar(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: "Horário já existe." });
    });

    it("deve criar um horário com sucesso", async () => {
      const created = { id: "slot-1" };
      (mockCalendario.findFirst as any).mockResolvedValue(null);
      (mockCalendario.create as any).mockResolvedValue(created);
      const req = mockReq({
        user: { id: "user-1", tipo: "PROFISSIONAL" },
        body: { dataHora: "2026-06-21T09:00:00.000Z", observacao: "Teste" },
      } as any);
      const res = mockRes();

      await calendarioCriar(req, res);

      expect(mockCalendario.create).toHaveBeenCalledWith({
        data: {
          profissionalId: "user-1",
          dataHora: new Date("2026-06-21T09:00:00.000Z"),
          observacao: "Teste",
          disponivel: true,
        },
      });
      expect(res.json).toHaveBeenCalledWith({ created });
    });

    it("deve retornar 500 quando ocorrer erro em calendarioCriar", async () => {
      (mockCalendario.findFirst as any).mockRejectedValue(new Error("falha"));
      const req = mockReq({
        user: { id: "user-1", tipo: "PROFISSIONAL" },
        body: { dataHora: "2026-06-21T09:00:00.000Z" },
      } as any);
      const res = mockRes();

      await calendarioCriar(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Erro interno." });
    });
  });

  describe("calendarioGerarDia", () => {
    it("deve gerar slots para o intervalo informado", async () => {
      (mockCalendario.findFirst as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (mockCalendario.create as any)
        .mockResolvedValueOnce({ id: "slot-1" })
        .mockResolvedValueOnce({ id: "slot-2" })
        .mockResolvedValueOnce({ id: "slot-3" });
      const req = mockReq({
        user: { id: "user-1", tipo: "PROFISSIONAL" },
        body: {
          data: "2026-06-21",
          inicio: "09:00",
          fim: "10:00",
          intervaloMinutos: 30,
        },
      } as any);
      const res = mockRes();

      await calendarioGerarDia(req, res);

      expect(mockCalendario.findFirst).toHaveBeenCalledTimes(3);
      expect(mockCalendario.create).toHaveBeenCalledTimes(3);
      expect(res.json).toHaveBeenCalledWith({
        criados: [{ id: "slot-1" }, { id: "slot-2" }, { id: "slot-3" }],
      });
    });
  });

  describe("calendarioAtualizar", () => {
    it("deve retornar 404 quando o slot não for encontrado", async () => {
      (mockCalendario.findFirst as any).mockResolvedValue(null);
      const req = mockReq({
        user: { id: "user-1", tipo: "PROFISSIONAL" },
        params: { id: "slot-1" },
        body: { observacao: "Atualizado", disponivel: false },
      } as any);
      const res = mockRes();

      await calendarioAtualizar(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Horário não encontrado.",
      });
    });

    it("deve atualizar o slot com sucesso", async () => {
      const atualizado = { id: "slot-1", observacao: "Atualizado" };
      (mockCalendario.findFirst as any).mockResolvedValue({ id: "slot-1" });
      (mockCalendario.update as any).mockResolvedValue(atualizado);
      const req = mockReq({
        user: { id: "user-1", tipo: "PROFISSIONAL" },
        params: { id: "slot-1" },
        body: { observacao: "Atualizado", disponivel: false },
      } as any);
      const res = mockRes();

      await calendarioAtualizar(req, res);

      expect(mockCalendario.update).toHaveBeenCalledWith({
        where: { id: "slot-1" },
        data: {
          observacao: "Atualizado",
          disponivel: false,
        },
      });
      expect(res.json).toHaveBeenCalledWith({ atualizado });
    });

    it("deve retornar 500 quando ocorrer erro em calendarioAtualizar", async () => {
      (mockCalendario.findFirst as any).mockRejectedValue(new Error("falha"));
      const req = mockReq({
        user: { id: "user-1", tipo: "PROFISSIONAL" },
        params: { id: "slot-1" },
        body: {},
      } as any);
      const res = mockRes();

      await calendarioAtualizar(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Erro interno." });
    });
  });

  describe("calendarioExcluir", () => {
    it("deve retornar 404 quando o slot não for encontrado", async () => {
      (mockCalendario.findFirst as any).mockResolvedValue(null);
      const req = mockReq({
        user: { id: "user-1", tipo: "PROFISSIONAL" },
        params: { id: "slot-1" },
      } as any);
      const res = mockRes();

      await calendarioExcluir(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Horário não encontrado.",
      });
    });

    it("deve excluir o slot com sucesso", async () => {
      (mockCalendario.findFirst as any).mockResolvedValue({ id: "slot-1" });
      (mockCalendario.delete as any).mockResolvedValue({ id: "slot-1" });
      const req = mockReq({
        user: { id: "user-1", tipo: "PROFISSIONAL" },
        params: { id: "slot-1" },
      } as any);
      const res = mockRes();

      await calendarioExcluir(req, res);

      expect(mockCalendario.delete).toHaveBeenCalledWith({
        where: { id: "slot-1" },
      });
      expect(res.json).toHaveBeenCalledWith({ deleted: true });
    });

    it("deve retornar 500 quando ocorrer erro em calendarioExcluir", async () => {
      (mockCalendario.findFirst as any).mockRejectedValue(new Error("falha"));
      const req = mockReq({
        user: { id: "user-1", tipo: "PROFISSIONAL" },
        params: { id: "slot-1" },
      } as any);
      const res = mockRes();

      await calendarioExcluir(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Erro interno." });
    });
  });
});
