import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  criarConsulta,
  listarConsultasDoCliente,
  listarConsultasDoProfissional,
  cancelarConsulta,
} from "../../controllers/consulta.controller.js";
import { mockReq, mockRes } from "../helpers/mockHttp.js";
// @ts-expect-error resolvido pelo moduleNameMapper do Jest
import { prisma } from "../lib/prisma.js";

jest.mock("../lib/prisma");

const mockConsulta = prisma.consulta as jest.Mocked<typeof prisma.consulta>;
const mockCalendarioProfissional =
  prisma.calendarioProfissional as jest.Mocked<typeof prisma.calendarioProfissional>;

describe("consulta.controller", () => {
  describe("criarConsulta", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("deve retornar 400 quando horarioId não for informado", async () => {
      const req = mockReq({
        body: {},
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();

      await criarConsulta(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "horarioId é obrigatório." });
    });

    it("deve retornar 404 quando o horário não for encontrado", async () => {
      const req = mockReq({
        body: { horarioId: "horario-1" },
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();

      (mockCalendarioProfissional.findUnique as any).mockResolvedValue(null);

      await criarConsulta(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Horário não encontrado." });
    });

    it("deve retornar 409 quando o horário estiver indisponível", async () => {
      const req = mockReq({
        body: { horarioId: "horario-1" },
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();

      (mockCalendarioProfissional.findUnique as any).mockResolvedValue({
        id: "horario-1",
        profissionalId: "prof-1",
        disponivel: false,
        dataHora: new Date("2026-07-10T10:00:00.000Z"),
      });

      await criarConsulta(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: "Horário indisponível." });
    });

    it("deve retornar 201 quando a consulta for criada com sucesso", async () => {
      const req = mockReq({
        body: { horarioId: "horario-1" },
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();
      const horario = {
        id: "horario-1",
        profissionalId: "prof-1",
        disponivel: true,
        dataHora: new Date("2026-07-10T10:00:00.000Z"),
      };
      const consulta = {
        id: "consulta-1",
        clienteId: "cliente-1",
        profissionalId: "prof-1",
        horarioId: "horario-1",
        dataHora: horario.dataHora,
        status: "AGENDADA",
      };

      (mockCalendarioProfissional.findUnique as any).mockResolvedValue(horario);
      (mockConsulta.create as any).mockResolvedValue(consulta);
      (mockCalendarioProfissional.update as any).mockResolvedValue({
        ...horario,
        disponivel: false,
      });

      await criarConsulta(req, res);

      expect(mockConsulta.create).toHaveBeenCalledWith({
        data: {
          profissionalId: "prof-1",
          clienteId: "cliente-1",
          horarioId: "horario-1",
          dataHora: horario.dataHora,
          status: "AGENDADA",
        },
        include: { cliente: true, profissional: true, horario: true },
      });
      expect(mockCalendarioProfissional.update).toHaveBeenCalledWith({
        where: { id: "horario-1" },
        data: { disponivel: false },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Consulta agendada com sucesso!",
        consulta,
      });
    });

    it("deve retornar 500 quando ocorrer erro interno", async () => {
      const req = mockReq({
        body: { horarioId: "horario-1" },
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();

      (mockCalendarioProfissional.findUnique as any).mockRejectedValue(new Error("falha"));

      await criarConsulta(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro interno ao criar consulta.",
      });
    });
  });

  describe("listarConsultasDoCliente", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("deve retornar 200 com as consultas do cliente", async () => {
      const req = mockReq({
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();
      const consultas = [{ id: "consulta-1" }, { id: "consulta-2" }];

      (mockConsulta.findMany as any).mockResolvedValue(consultas);

      await listarConsultasDoCliente(req, res);

      expect(mockConsulta.findMany).toHaveBeenCalledWith({
        where: { clienteId: "cliente-1" },
        include: {
          profissional: true,
          horario: true,
          avaliacoes: { select: { id: true } },
        },
        orderBy: { dataHora: "asc" },
      });
      expect((res.status as jest.Mock).mock.calls[0]?.[0] ?? 200).toBe(200);
      expect(res.json).toHaveBeenCalledWith(consultas);
    });

    it("deve retornar 500 quando ocorrer erro ao listar consultas do cliente", async () => {
      const req = mockReq({
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();

      (mockConsulta.findMany as any).mockRejectedValue(new Error("falha"));

      await listarConsultasDoCliente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Erro ao buscar consultas." });
    });
  });

  describe("listarConsultasDoProfissional", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("deve retornar 200 com as consultas do profissional", async () => {
      const req = mockReq({
        user: { id: "prof-1", email: "a", cpf: "b", tipo: "PROFISSIONAL" },
      });
      const res = mockRes();
      const consultas = [{ id: "consulta-1" }];

      (mockConsulta.findMany as any).mockResolvedValue(consultas);

      await listarConsultasDoProfissional(req, res);

      expect(mockConsulta.findMany).toHaveBeenCalledWith({
        where: { profissionalId: "prof-1" },
        include: {
          cliente: { select: { nome: true } },
          horario: true,
          avaliacoes: { select: { id: true, nota: true } },
        },
        orderBy: { dataHora: "asc" },
      });
      expect((res.status as jest.Mock).mock.calls[0]?.[0] ?? 200).toBe(200);
      expect(res.json).toHaveBeenCalledWith(consultas);
    });

    it("deve retornar 500 quando ocorrer erro ao listar consultas do profissional", async () => {
      const req = mockReq({
        user: { id: "prof-1", email: "a", cpf: "b", tipo: "PROFISSIONAL" },
      });
      const res = mockRes();

      (mockConsulta.findMany as any).mockRejectedValue(new Error("falha"));

      await listarConsultasDoProfissional(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Erro ao buscar consultas." });
    });
  });

  describe("cancelarConsulta", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("deve retornar 404 quando a consulta não for encontrada", async () => {
      const req = mockReq({
        params: { id: "consulta-1" },
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();

      (mockConsulta.findUnique as any).mockResolvedValue(null);

      await cancelarConsulta(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Consulta não encontrada." });
    });

    it("deve retornar 403 quando o cliente for diferente do dono da consulta", async () => {
      const req = mockReq({
        params: { id: "consulta-1" },
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();

      (mockConsulta.findUnique as any).mockResolvedValue({
        id: "consulta-1",
        clienteId: "cliente-2",
        horarioId: "horario-1",
        dataHora: new Date("2026-07-10T10:00:00.000Z"),
        horario: { id: "horario-1" },
      });

      await cancelarConsulta(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Você não pode cancelar essa consulta.",
      });
    });

    it("deve retornar 400 quando faltarem menos de 24h para a consulta", async () => {
      const req = mockReq({
        params: { id: "consulta-1" },
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();

      (mockConsulta.findUnique as any).mockResolvedValue({
        id: "consulta-1",
        clienteId: "cliente-1",
        horarioId: "horario-1",
        dataHora: new Date(Date.now() + 2 * 60 * 60 * 1000),
        horario: { id: "horario-1" },
      });

      await cancelarConsulta(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Cancelamento permitido somente com 24h de antecedência.",
      });
    });

    it("deve retornar 200 quando a consulta for cancelada com sucesso", async () => {
      const req = mockReq({
        params: { id: "consulta-1" },
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();
      const consulta = {
        id: "consulta-1",
        clienteId: "cliente-1",
        horarioId: "horario-1",
        dataHora: new Date(Date.now() + 48 * 60 * 60 * 1000),
        horario: { id: "horario-1" },
      };

      (mockConsulta.findUnique as any).mockResolvedValue(consulta);
      (mockConsulta.update as any).mockResolvedValue({
        ...consulta,
        status: "CANCELADA",
      });
      (mockCalendarioProfissional.update as any).mockResolvedValue({
        id: "horario-1",
        disponivel: true,
      });

      await cancelarConsulta(req, res);

      expect(mockConsulta.update).toHaveBeenCalledWith({
        where: { id: "consulta-1" },
        data: { status: "CANCELADA", canceladaPor: "CLIENTE" },
      });
      expect(mockCalendarioProfissional.update).toHaveBeenCalledWith({
        where: { id: "horario-1" },
        data: { disponivel: true },
      });
      expect((res.status as jest.Mock).mock.calls[0]?.[0] ?? 200).toBe(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Consulta cancelada com sucesso.",
      });
    });

    it("deve retornar 500 quando ocorrer erro ao cancelar consulta", async () => {
      const req = mockReq({
        params: { id: "consulta-1" },
        user: { id: "cliente-1", email: "a", cpf: "b", tipo: "CLIENTE" },
      });
      const res = mockRes();

      (mockConsulta.findUnique as any).mockRejectedValue(new Error("falha"));

      await cancelarConsulta(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Erro ao cancelar consulta." });
    });
  });
});
