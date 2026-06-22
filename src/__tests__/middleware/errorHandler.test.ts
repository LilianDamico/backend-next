import { jest } from "@jest/globals";
import { errorHandler } from "../../middleware/errorHandler.js";
import { mockReq, mockRes, mockNext } from "../helpers/mockHttp.js";

describe("errorHandler", () => {
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("deve responder com status 500 e mensagem de erro genérica", () => {
    const err = new Error("falha inesperada");
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Erro interno do servidor",
      message: "falha inesperada",
    });
  });

  it("deve usar mensagem padrão quando o erro não tem message", () => {
    const err = {};
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Algo deu errado." })
    );
  });

  it("deve logar o erro no console.error", () => {
    const err = new Error("boom");
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    errorHandler(err, req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith("🔥 Erro interno:", err);
  });
});
