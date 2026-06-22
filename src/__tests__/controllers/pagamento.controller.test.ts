import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createPagamento, getPagamentos } from "../../controllers/pagamento.controller.js";
import { mockReq, mockRes } from "../helpers/mockHttp.js";
// @ts-expect-error resolvido pelo moduleNameMapper do Jest
import { prisma } from "../lib/prisma.js";

jest.mock("../lib/prisma");

const mockPagamento = prisma.pagamento as jest.Mocked<typeof prisma.pagamento>;

describe("pagamento.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPagamentos", () => {
    it("deve retornar a lista de pagamentos com sucesso", async () => {
      const pagamentos = [{ id: "pag-1" }, { id: "pag-2" }];
      (mockPagamento.findMany as any).mockResolvedValue(pagamentos);
      const req = mockReq();
      const res = mockRes();

      await getPagamentos(req, res);

      expect(mockPagamento.findMany).toHaveBeenCalledWith({
        include: { consulta: true },
      });
      expect(res.json).toHaveBeenCalledWith(pagamentos);
    });

    it("deve retornar 500 quando ocorrer erro ao buscar pagamentos", async () => {
      (mockPagamento.findMany as any).mockRejectedValue(new Error("falha"));
      const req = mockReq();
      const res = mockRes();

      await getPagamentos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao buscar pagamentos",
      });
    });
  });

  describe("createPagamento", () => {
    it("deve criar um pagamento com sucesso", async () => {
      const pagamento = { id: "pag-1", valor: 150 };
      (mockPagamento.create as any).mockResolvedValue(pagamento);
      const req = mockReq({
        body: {
          valor: 150,
          metodo: "PIX",
          status: "PAGO",
          consultaId: "c1",
        },
      });
      const res = mockRes();

      await createPagamento(req, res);

      expect(mockPagamento.create).toHaveBeenCalledWith({
        data: {
          valor: 150,
          metodo: "PIX",
          status: "PAGO",
          consultaId: "c1",
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(pagamento);
    });

    it("deve retornar 500 quando ocorrer erro ao criar pagamento", async () => {
      (mockPagamento.create as any).mockRejectedValue(new Error("falha"));
      const req = mockReq({
        body: {
          valor: 150,
          metodo: "PIX",
          status: "PAGO",
          consultaId: "c1",
        },
      });
      const res = mockRes();

      await createPagamento(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao criar pagamento",
      });
    });
  });
});
