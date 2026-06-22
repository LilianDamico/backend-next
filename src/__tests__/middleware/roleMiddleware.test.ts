import { jest } from "@jest/globals";
import { permitirRoles } from "../../middleware/roleMiddleware.js";
import { mockReq, mockRes, mockNext } from "../helpers/mockHttp.js";

describe("roleMiddleware — permitirRoles", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deve retornar 401 quando req.user não está definido", () => {
    const middleware = permitirRoles("ADMIN");
    const req = mockReq({ user: undefined });
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Usuário não autenticado." });
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 403 quando o tipo do usuário não está na lista de roles permitidos", () => {
    const middleware = permitirRoles("ADMIN");
    const req = mockReq({ user: { id: "u1", email: "a@b.com", cpf: "123", tipo: "CLIENTE", roles: [] } });
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Acesso negado. Permissão insuficiente." });
    expect(next).not.toHaveBeenCalled();
  });

  it("deve chamar next() quando o tipo do usuário está na lista de roles permitidos", () => {
    const middleware = permitirRoles("CLIENTE", "PROFISSIONAL");
    const req = mockReq({ user: { id: "u1", email: "a@b.com", cpf: "123", tipo: "CLIENTE", roles: [] } });
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("deve chamar next() quando o usuário possui a role no array roles (suporte a futuras roles)", () => {
    const middleware = permitirRoles("SUPER_ADMIN");
    const req = mockReq({ user: { id: "u1", email: "a@b.com", cpf: "123", tipo: "CLIENTE", roles: ["SUPER_ADMIN"] } });
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("não deve vazar permissões na resposta 403", () => {
    const middleware = permitirRoles("ADMIN");
    const req = mockReq({ user: { id: "u1", email: "a@b.com", cpf: "123", tipo: "CLIENTE", roles: [] } });
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body).not.toHaveProperty("permitido");
    expect(body).not.toHaveProperty("recebido");
  });
});
