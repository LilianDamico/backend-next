import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import { autenticarJWT } from "../../middleware/authMiddleware.js";
import { mockReq, mockRes, mockNext } from "../helpers/mockHttp.js";

jest.mock("jsonwebtoken");
const jwtVerify = jwt.verify as jest.Mock;

describe("authMiddleware — autenticarJWT", () => {
  const next = mockNext();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  it("deve retornar 401 quando não há header Authorization", () => {
    const req = mockReq({ headers: {} });
    const res = mockRes();

    autenticarJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token não fornecido." });
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 401 quando o header Authorization está malformado (sem Bearer)", () => {
    const req = mockReq({ headers: { authorization: "somente-token" } });
    const res = mockRes();

    autenticarJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token malformado." });
  });

  it("deve retornar 403 quando o token é inválido ou expirado", () => {
    jwtVerify.mockImplementation(() => { throw new Error("invalid token"); });
    const req = mockReq({ headers: { authorization: "Bearer token-invalido" } });
    const res = mockRes();

    autenticarJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido ou expirado." });
    expect(next).not.toHaveBeenCalled();
  });

  it("deve chamar next() e popular req.user quando o token é válido", () => {
    const payload = { id: "u1", email: "a@b.com", cpf: "123", tipo: "CLIENTE" as const };
    jwtVerify.mockReturnValue(payload);

    const req = mockReq({ headers: { authorization: "Bearer token-valido" } });
    const res = mockRes();
    const nextFn = mockNext();

    autenticarJWT(req, res, nextFn);

    expect(nextFn).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ id: "u1", email: "a@b.com", tipo: "CLIENTE" });
  });

  it("deve popular req.user.roles como array vazio quando não há roles no token", () => {
    const payload = { id: "u1", email: "a@b.com", cpf: "123", tipo: "CLIENTE" as const };
    jwtVerify.mockReturnValue(payload);

    const req = mockReq({ headers: { authorization: "Bearer token-valido" } });
    const res = mockRes();
    const nextFn = mockNext();

    autenticarJWT(req, res, nextFn);

    expect(req.user!.roles).toEqual([]);
  });
});
