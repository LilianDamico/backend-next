import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  excluirConta,
  historicoConsentimentos,
  registrarConsentimento,
  revogarConsentimento,
  statusConsentimento,
} from "../../controllers/lgpd.controller.js";
import { VERSAO_LGPD } from "../../lgpd/versaoLGPD.js";
import { mockReq, mockRes } from "../helpers/mockHttp.js";

const prisma: any = require("../lib/prisma").prisma;

describe("lgpd.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registrarConsentimento", () => {
    it("deve retornar 401 quando o usuário não estiver autenticado", async () => {
      const req = mockReq();
      const res = mockRes();

      await registrarConsentimento(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Não autenticado." });
    });

    it("deve registrar o consentimento com sucesso", async () => {
      const consentimento = { id: "cons-1", userId: "user-1", aceito: true };
      prisma.consentimento.create.mockResolvedValue(consentimento);
      const req = mockReq({ user: { id: "user-1" } } as any);
      const res = mockRes();

      await registrarConsentimento(req, res);

      expect(prisma.consentimento.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-1",
          aceito: true,
          metodo: "web",
          ip: "127.0.0.1",
          hashIp: expect.any(String),
          versao: VERSAO_LGPD,
          expiraEm: expect.any(Date),
        }),
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Consentimento registrado com sucesso.",
        consentimento,
      });
    });
  });

  describe("revogarConsentimento", () => {
    it("deve retornar 401 quando o usuário não estiver autenticado", async () => {
      const req = mockReq();
      const res = mockRes();

      await revogarConsentimento(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Não autenticado." });
    });

    it("deve revogar o consentimento com sucesso", async () => {
      const consentimento = { id: "cons-2", userId: "user-1", aceito: false };
      prisma.consentimento.create.mockResolvedValue(consentimento);
      const req = mockReq({ user: { id: "user-1" } } as any);
      const res = mockRes();

      await revogarConsentimento(req, res);

      expect(prisma.consentimento.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-1",
          aceito: false,
          metodo: "revogado",
          versao: VERSAO_LGPD,
        }),
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "Consentimento revogado.",
        consentimento,
      });
    });
  });

  describe("statusConsentimento", () => {
    it("deve retornar 401 quando o usuário não estiver autenticado", async () => {
      const req = mockReq();
      const res = mockRes();

      await statusConsentimento(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Não autenticado." });
    });

    it("deve retornar status ausente quando não houver consentimento", async () => {
      prisma.consentimento.findFirst.mockResolvedValue(null);
      const req = mockReq({ user: { id: "user-1" } } as any);
      const res = mockRes();

      await statusConsentimento(req, res);

      expect(res.json).toHaveBeenCalledWith({
        status: "ausente",
        versaoAtual: VERSAO_LGPD,
      });
    });

    it("deve retornar status ativo quando o consentimento estiver aceito e válido", async () => {
      const ultimo = {
        id: "cons-1",
        aceito: true,
        expiraEm: new Date(Date.now() + 60_000),
      };
      prisma.consentimento.findFirst.mockResolvedValue(ultimo);
      const req = mockReq({ user: { id: "user-1" } } as any);
      const res = mockRes();

      await statusConsentimento(req, res);

      expect(res.json).toHaveBeenCalledWith({
        status: "ativo",
        versaoAtual: VERSAO_LGPD,
        ultimo,
      });
    });

    it("deve retornar status expirado quando o consentimento estiver vencido", async () => {
      const ultimo = {
        id: "cons-1",
        aceito: true,
        expiraEm: new Date(Date.now() - 60_000),
      };
      prisma.consentimento.findFirst.mockResolvedValue(ultimo);
      const req = mockReq({ user: { id: "user-1" } } as any);
      const res = mockRes();

      await statusConsentimento(req, res);

      expect(res.json).toHaveBeenCalledWith({
        status: "expirado",
        versaoAtual: VERSAO_LGPD,
        ultimo,
      });
    });

    it("deve retornar status revogado quando o consentimento não estiver aceito", async () => {
      const ultimo = {
        id: "cons-1",
        aceito: false,
        expiraEm: new Date(Date.now() + 60_000),
      };
      prisma.consentimento.findFirst.mockResolvedValue(ultimo);
      const req = mockReq({ user: { id: "user-1" } } as any);
      const res = mockRes();

      await statusConsentimento(req, res);

      expect(res.json).toHaveBeenCalledWith({
        status: "revogado",
        versaoAtual: VERSAO_LGPD,
        ultimo,
      });
    });
  });

  describe("historicoConsentimentos", () => {
    it("deve retornar 401 quando o usuário não estiver autenticado", async () => {
      const req = mockReq();
      const res = mockRes();

      await historicoConsentimentos(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Não autenticado." });
    });

    it("deve retornar o histórico de consentimentos", async () => {
      const registros = [{ id: "cons-1" }, { id: "cons-2" }];
      prisma.consentimento.findMany.mockResolvedValue(registros);
      const req = mockReq({ user: { id: "user-1" } } as any);
      const res = mockRes();

      await historicoConsentimentos(req, res);

      expect(prisma.consentimento.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        orderBy: { criadoEm: "desc" },
      });
      expect(res.json).toHaveBeenCalledWith({ registros });
    });
  });

  describe("excluirConta", () => {
    it("deve retornar 401 quando o usuário não estiver autenticado", async () => {
      const req = mockReq();
      const res = mockRes();

      await excluirConta(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Não autenticado." });
    });

    it("deve realizar soft delete da conta com sucesso", async () => {
      prisma.user.update.mockResolvedValue({ id: "user-1", deletado: true });
      const req = mockReq({ user: { id: "user-1" } } as any);
      const res = mockRes();

      await excluirConta(req, res);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { deletado: true },
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "Conta marcada como excluída.",
      });
    });
  });
});
