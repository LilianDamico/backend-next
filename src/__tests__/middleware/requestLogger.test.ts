import { jest } from "@jest/globals";
import { requestLogger } from "../../middleware/requestLogger.js";
import { mockReq, mockRes, mockNext } from "../helpers/mockHttp.js";

describe("requestLogger", () => {
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("deve chamar next()", () => {
    const req = mockReq({ method: "GET", originalUrl: "/api/users" });
    const res = mockRes();
    const next = mockNext();

    requestLogger(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("deve logar o método e a URL da requisição", () => {
    const req = mockReq({ method: "POST", originalUrl: "/api/auth/login" });
    const res = mockRes();
    const next = mockNext();

    requestLogger(req, res, next);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logOutput: string = consoleSpy.mock.calls[0][0];
    expect(logOutput).toContain("POST");
    expect(logOutput).toContain("/api/auth/login");
  });

  it("deve incluir um timestamp ISO no log", () => {
    const req = mockReq({ method: "GET", originalUrl: "/ping" });
    const res = mockRes();
    const next = mockNext();

    requestLogger(req, res, next);

    const logOutput: string = consoleSpy.mock.calls[0][0];
    // Verifica formato ISO básico: YYYY-MM-DD
    expect(logOutput).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});
