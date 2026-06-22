import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  listarConsentimentos,
  listarTermosUsuario,
} from "../../controllers/lgpd.admin.controller.js";
import { mockReq, mockRes } from "../helpers/mockHttp.js";
// @ts-expect-error resolvido pelo moduleNameMapper do Jest
import { prisma } from "../lib/prisma.js";

describe("lgpd.admin.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listarConsentimentos", () => {
    it("deve buscar todos os consentimentos quando userId não for informado", async () => {
      const lista = [{ id: "cons-1" }];
      prisma.consentimento.findMany.mockResolvedValue(lista);
      const req = mockReq({ query: {} });
      const res = mockRes();

      await listarConsentimentos(req, res);

      expect(prisma.consentimento.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { criadoEm: "desc" },
        include: { user: true },
      });
      expect(res.json).toHaveBeenCalledWith(lista);
    });

    it("deve filtrar consentimentos por userId quando informado", async () => {
      const lista = [{ id: "cons-1", userId: "user-1" }];
      prisma.consentimento.findMany.mockResolvedValue(lista);
      const req = mockReq({ query: { userId: "user-1" } });
      const res = mockRes();

      await listarConsentimentos(req, res);

      expect(prisma.consentimento.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        orderBy: { criadoEm: "desc" },
        include: { user: true },
      });
      expect(res.json).toHaveBeenCalledWith(lista);
    });
  });

  describe("listarTermosUsuario", () => {
    it("deve retornar usuário e consentimentos do usuário", async () => {
      const usuario = { id: "user-1", nome: "Maria" };
      const consentimentos = [{ id: "cons-1" }];
      prisma.user.findUnique.mockResolvedValue(usuario);
      prisma.consentimento.findMany.mockResolvedValue(consentimentos);
      const req = mockReq({ params: { userId: "user-1" } });
      const res = mockRes();

      await listarTermosUsuario(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
      });
      expect(prisma.consentimento.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        orderBy: { criadoEm: "desc" },
      });
      expect(res.json).toHaveBeenCalledWith({
        usuario,
        consentimentos,
      });
    });
  });
});
