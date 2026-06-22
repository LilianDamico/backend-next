import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  atualizarHorarioPorNome,
  criarHorarioPorNome,
  deletarHorarioPorNome,
  listarHorariosPorNome,
} from "../../controllers/horario.controller.js";
import { mockReq, mockRes } from "../helpers/mockHttp.js";

const prisma: any = require("../lib/prisma").prisma;

describe("horario.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listarHorariosPorNome", () => {
    it("deve retornar 400 quando userNome não for informado", async () => {
      const req = mockReq({ params: {} });
      const res = mockRes();

      await listarHorariosPorNome(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Nome do profissional é obrigatório.",
      });
    });

    it("deve retornar 404 quando o profissional não for encontrado", async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const req = mockReq({ params: { userNome: "João" } });
      const res = mockRes();

      await listarHorariosPorNome(req, res);

      expect(prisma.user.findFirst).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Profissional não encontrado.",
      });
    });

    it("deve retornar a lista de horários disponíveis com sucesso", async () => {
      const profissional = { id: "prof-1", nome: "João" };
      const horarios = [{ id: "h1" }, { id: "h2" }];
      prisma.user.findFirst.mockResolvedValue(profissional);
      prisma.calendarioProfissional.findMany.mockResolvedValue(horarios);
      const req = mockReq({ params: { userNome: "João" } });
      const res = mockRes();

      await listarHorariosPorNome(req, res);

      expect(prisma.calendarioProfissional.findMany).toHaveBeenCalledWith({
        where: {
          profissionalId: profissional.id,
          disponivel: true,
        },
        orderBy: { dataHora: "asc" },
      });
      expect(res.json).toHaveBeenCalledWith(horarios);
    });

    it("deve retornar 500 quando ocorrer erro inesperado", async () => {
      prisma.user.findFirst.mockRejectedValue(new Error("falha"));
      const req = mockReq({ params: { userNome: "João" } });
      const res = mockRes();

      await listarHorariosPorNome(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao buscar horários.",
      });
    });
  });

  describe("criarHorarioPorNome", () => {
    it("deve retornar 400 quando dataHora não for informada", async () => {
      const req = mockReq({ params: { userNome: "João" }, body: {} });
      const res = mockRes();

      await criarHorarioPorNome(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "dataHora é obrigatório." });
    });

    it("deve retornar 404 quando o profissional não for encontrado", async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const req = mockReq({
        params: { userNome: "João" },
        body: { dataHora: "2026-06-21T09:00:00.000Z" },
      });
      const res = mockRes();

      await criarHorarioPorNome(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Profissional não encontrado.",
      });
    });

    it("deve retornar 409 quando o horário já existir", async () => {
      prisma.user.findFirst.mockResolvedValue({ id: "prof-1" });
      prisma.calendarioProfissional.findFirst.mockResolvedValue({ id: "h1" });
      const req = mockReq({
        params: { userNome: "João" },
        body: { dataHora: "2026-06-21T09:00:00.000Z" },
      });
      const res = mockRes();

      await criarHorarioPorNome(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "Este horário já está cadastrado.",
      });
    });

    it("deve criar um horário com sucesso", async () => {
      const dataHora = "2026-06-21T09:00:00.000Z";
      const criado = { id: "h1", dataHora };
      prisma.user.findFirst.mockResolvedValue({ id: "prof-1" });
      prisma.calendarioProfissional.findFirst.mockResolvedValue(null);
      prisma.calendarioProfissional.create.mockResolvedValue(criado);
      const req = mockReq({
        params: { userNome: "João" },
        body: { dataHora, observacao: "Manhã" },
      });
      const res = mockRes();

      await criarHorarioPorNome(req, res);

      expect(prisma.calendarioProfissional.create).toHaveBeenCalledWith({
        data: {
          profissionalId: "prof-1",
          dataHora: new Date(dataHora),
          observacao: "Manhã",
          disponivel: true,
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(criado);
    });

    it("deve retornar 500 quando ocorrer erro inesperado", async () => {
      prisma.user.findFirst.mockRejectedValue(new Error("falha"));
      const req = mockReq({
        params: { userNome: "João" },
        body: { dataHora: "2026-06-21T09:00:00.000Z" },
      });
      const res = mockRes();

      await criarHorarioPorNome(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao criar horário.",
      });
    });
  });

  describe("atualizarHorarioPorNome", () => {
    it("deve retornar 400 quando horarioId não for informado", async () => {
      const req = mockReq({ params: { userNome: "João" }, body: {} });
      const res = mockRes();

      await atualizarHorarioPorNome(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "horarioId é obrigatório.",
      });
    });

    it("deve retornar 404 quando o profissional não for encontrado", async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const req = mockReq({
        params: { userNome: "João" },
        body: { horarioId: "h1" },
      });
      const res = mockRes();

      await atualizarHorarioPorNome(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Profissional não encontrado.",
      });
    });

    it("deve retornar 404 quando o horário não for encontrado", async () => {
      prisma.user.findFirst.mockResolvedValue({ id: "prof-1" });
      prisma.calendarioProfissional.findFirst.mockResolvedValue(null);
      const req = mockReq({
        params: { userNome: "João" },
        body: { horarioId: "h1", observacao: "Atualizado" },
      });
      const res = mockRes();

      await atualizarHorarioPorNome(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Horário não encontrado.",
      });
    });

    it("deve atualizar o horário com sucesso", async () => {
      const atualizado = { id: "h1", observacao: "Atualizado", disponivel: false };
      prisma.user.findFirst.mockResolvedValue({ id: "prof-1" });
      prisma.calendarioProfissional.findFirst.mockResolvedValue({ id: "h1" });
      prisma.calendarioProfissional.update.mockResolvedValue(atualizado);
      const req = mockReq({
        params: { userNome: "João" },
        body: { horarioId: "h1", observacao: "Atualizado", disponivel: false },
      });
      const res = mockRes();

      await atualizarHorarioPorNome(req, res);

      expect(prisma.calendarioProfissional.update).toHaveBeenCalledWith({
        where: { id: "h1" },
        data: { observacao: "Atualizado", disponivel: false },
      });
      expect(res.json).toHaveBeenCalledWith(atualizado);
    });

    it("deve retornar 500 quando ocorrer erro inesperado", async () => {
      prisma.user.findFirst.mockRejectedValue(new Error("falha"));
      const req = mockReq({
        params: { userNome: "João" },
        body: { horarioId: "h1" },
      });
      const res = mockRes();

      await atualizarHorarioPorNome(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao atualizar horário.",
      });
    });
  });

  describe("deletarHorarioPorNome", () => {
    it("deve retornar 400 quando horarioId não for informado", async () => {
      const req = mockReq({ params: { userNome: "João" }, body: {} });
      const res = mockRes();

      await deletarHorarioPorNome(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "horarioId é obrigatório.",
      });
    });

    it("deve retornar 404 quando o profissional não for encontrado", async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const req = mockReq({
        params: { userNome: "João" },
        body: { horarioId: "h1" },
      });
      const res = mockRes();

      await deletarHorarioPorNome(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Profissional não encontrado.",
      });
    });

    it("deve retornar 404 quando o horário não for encontrado", async () => {
      prisma.user.findFirst.mockResolvedValue({ id: "prof-1" });
      prisma.calendarioProfissional.findFirst.mockResolvedValue(null);
      const req = mockReq({
        params: { userNome: "João" },
        body: { horarioId: "h1" },
      });
      const res = mockRes();

      await deletarHorarioPorNome(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Horário não encontrado.",
      });
    });

    it("deve deletar o horário com sucesso", async () => {
      prisma.user.findFirst.mockResolvedValue({ id: "prof-1" });
      prisma.calendarioProfissional.findFirst.mockResolvedValue({ id: "h1" });
      prisma.calendarioProfissional.delete.mockResolvedValue({ id: "h1" });
      const req = mockReq({
        params: { userNome: "João" },
        body: { horarioId: "h1" },
      });
      const res = mockRes();

      await deletarHorarioPorNome(req, res);

      expect(prisma.calendarioProfissional.delete).toHaveBeenCalledWith({
        where: { id: "h1" },
      });
      expect(res.json).toHaveBeenCalledWith({ message: "Horário removido." });
    });

    it("deve retornar 500 quando ocorrer erro inesperado", async () => {
      prisma.user.findFirst.mockRejectedValue(new Error("falha"));
      const req = mockReq({
        params: { userNome: "João" },
        body: { horarioId: "h1" },
      });
      const res = mockRes();

      await deletarHorarioPorNome(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao remover horário.",
      });
    });
  });
});
