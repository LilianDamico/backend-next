import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  criarPrescricao,
  listarPrescricoesPorNomePaciente,
  listarPrescricoesPorNomeProfissional,
} from "../../controllers/prescricao.controller.js";
import { mockReq, mockRes } from "../helpers/mockHttp.js";

const prisma: any = require("../lib/prisma").prisma;

describe("prescricao.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("criarPrescricao", () => {
    it("deve retornar 400 quando os dados obrigatórios estiverem incompletos", async () => {
      const req = mockReq({ body: { conteudo: "Tomar água" } });
      const res = mockRes();

      await criarPrescricao(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Dados incompletos." });
    });

    it("deve retornar 404 quando profissional ou paciente não forem encontrados", async () => {
      prisma.user.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: "pac-1" });
      const req = mockReq({
        body: {
          conteudo: "Tomar água",
          tipo: "MEDICAMENTO",
          profissionalNome: "Dr. João",
          pacienteNome: "Maria",
          consultaId: "c1",
        },
      });
      const res = mockRes();

      await criarPrescricao(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Profissional ou paciente não encontrado.",
      });
    });

    it("deve criar a prescrição com sucesso", async () => {
      const nova = { id: "presc-1" };
      prisma.user.findFirst
        .mockResolvedValueOnce({ id: "prof-1" })
        .mockResolvedValueOnce({ id: "pac-1" });
      prisma.prescricao.create.mockResolvedValue(nova);
      const req = mockReq({
        body: {
          conteudo: "Tomar água",
          tipo: "MEDICAMENTO",
          profissionalNome: "Dr. João",
          pacienteNome: "Maria",
          consultaId: "c1",
        },
      });
      const res = mockRes();

      await criarPrescricao(req, res);

      expect(prisma.prescricao.create).toHaveBeenCalledWith({
        data: {
          conteudo: "Tomar água",
          tipo: "MEDICAMENTO",
          profissionalId: "prof-1",
          pacienteId: "pac-1",
          consultaId: "c1",
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Prescrição criada com sucesso!",
        nova,
      });
    });
  });

  describe("listarPrescricoesPorNomePaciente", () => {
    it("deve retornar 404 quando o paciente não for encontrado", async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const req = mockReq({ params: { nome: "Maria" } });
      const res = mockRes();

      await listarPrescricoesPorNomePaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Paciente não encontrado." });
    });

    it("deve listar prescrições do paciente com sucesso", async () => {
      const lista = [{ id: "presc-1" }];
      prisma.user.findFirst.mockResolvedValue({ id: "pac-1" });
      prisma.prescricao.findMany.mockResolvedValue(lista);
      const req = mockReq({ params: { nome: "Maria" } });
      const res = mockRes();

      await listarPrescricoesPorNomePaciente(req, res);

      expect(prisma.prescricao.findMany).toHaveBeenCalledWith({
        where: { pacienteId: "pac-1" },
        include: { consulta: true },
      });
      expect(res.json).toHaveBeenCalledWith(lista);
    });
  });

  describe("listarPrescricoesPorNomeProfissional", () => {
    it("deve retornar 404 quando o profissional não for encontrado", async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const req = mockReq({ params: { nome: "Dr. João" } });
      const res = mockRes();

      await listarPrescricoesPorNomeProfissional(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Profissional não encontrado.",
      });
    });

    it("deve listar prescrições do profissional com sucesso", async () => {
      const lista = [{ id: "presc-1" }];
      prisma.user.findFirst.mockResolvedValue({ id: "prof-1" });
      prisma.prescricao.findMany.mockResolvedValue(lista);
      const req = mockReq({ params: { nome: "Dr. João" } });
      const res = mockRes();

      await listarPrescricoesPorNomeProfissional(req, res);

      expect(prisma.prescricao.findMany).toHaveBeenCalledWith({
        where: { profissionalId: "prof-1" },
        include: { consulta: true, paciente: true },
      });
      expect(res.json).toHaveBeenCalledWith(lista);
    });
  });
});
