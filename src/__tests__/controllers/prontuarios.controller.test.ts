import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { listarPorUsuario } from "../../controllers/prontuarios.controller.js";
import { mockReq, mockRes } from "../helpers/mockHttp.js";
// @ts-expect-error resolvido pelo moduleNameMapper do Jest
import { prisma } from "../lib/prisma.js";

jest.mock("../lib/prisma");

const mockProntuario = prisma.prontuario as jest.Mocked<typeof prisma.prontuario>;

describe("prontuarios.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 400 quando o nome não for informado", async () => {
    const req = mockReq({ params: {} });
    const res = mockRes();

    await listarPorUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Nome não informado" });
  });

  it("deve listar prontuários por usuário com sucesso", async () => {
    const prontuarios = [{ id: "p1" }];
    (mockProntuario.findMany as any).mockResolvedValue(prontuarios);
    const req = mockReq({ params: { nome: "Maria" } });
    const res = mockRes();

    await listarPorUsuario(req, res);

    expect(mockProntuario.findMany).toHaveBeenCalledWith({
      where: {
        consulta: {
          OR: [
            { cliente: { nome: { contains: "Maria", mode: "insensitive" } } },
            { profissional: { nome: { contains: "Maria", mode: "insensitive" } } },
          ],
        },
      },
      include: {
        consulta: {
          include: {
            cliente: true,
            profissional: true,
          },
        },
      },
      orderBy: { criadoEm: "desc" },
    });
    expect(res.json).toHaveBeenCalledWith(prontuarios);
  });

  it("deve retornar 500 quando ocorrer erro ao buscar prontuários", async () => {
    (mockProntuario.findMany as any).mockRejectedValue(new Error("falha"));
    const req = mockReq({ params: { nome: "Maria" } });
    const res = mockRes();

    await listarPorUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Erro ao buscar prontuários",
    });
  });
});
