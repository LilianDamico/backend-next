import { jest } from "@jest/globals";
import { prisma } from "../../lib/prisma.js";
import { requireLgpdAtivo } from "../../middleware/requireLgpd.js";
import { mockReq, mockRes, mockNext } from "../helpers/mockHttp.js";

describe("requireLgpd — requireLgpdAtivo", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deve retornar 401 quando req.user não está definido", async () => {
    const req = mockReq({ user: undefined } as any);
    const res = mockRes();
    const next = mockNext();

    await requireLgpdAtivo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 428 LGPD_CONSENT_REQUIRED quando não há consentimento", async () => {
    (prisma.consentimento.findFirst as jest.Mock<any>).mockResolvedValue(null);

    const req = mockReq({ user: { id: "u1" } } as any);
    const res = mockRes();
    const next = mockNext();

    await requireLgpdAtivo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(428);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "LGPD_CONSENT_REQUIRED" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 428 LGPD_CONSENT_REQUIRED quando aceito é false", async () => {
    (prisma.consentimento.findFirst as jest.Mock<any>).mockResolvedValue({ aceito: false, expiraEm: null });

    const req = mockReq({ user: { id: "u1" } } as any);
    const res = mockRes();
    const next = mockNext();

    await requireLgpdAtivo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(428);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "LGPD_CONSENT_REQUIRED" })
    );
  });

  it("deve retornar 428 LGPD_CONSENT_EXPIRED quando consentimento está expirado", async () => {
    const expiraEm = new Date(Date.now() - 1000); // passado
    (prisma.consentimento.findFirst as jest.Mock<any>).mockResolvedValue({ aceito: true, expiraEm });

    const req = mockReq({ user: { id: "u1" } } as any);
    const res = mockRes();
    const next = mockNext();

    await requireLgpdAtivo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(428);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "LGPD_CONSENT_EXPIRED" })
    );
  });

  it("deve chamar next() quando consentimento está ativo e não expirado", async () => {
    const expiraEm = new Date(Date.now() + 1_000_000);
    (prisma.consentimento.findFirst as jest.Mock<any>).mockResolvedValue({ aceito: true, expiraEm });

    const req = mockReq({ user: { id: "u1" } } as any);
    const res = mockRes();
    const next = mockNext();

    await requireLgpdAtivo(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("deve chamar next() quando consentimento está ativo sem expiração", async () => {
    (prisma.consentimento.findFirst as jest.Mock<any>).mockResolvedValue({ aceito: true, expiraEm: null });

    const req = mockReq({ user: { id: "u1" } } as any);
    const res = mockRes();
    const next = mockNext();

    await requireLgpdAtivo(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
