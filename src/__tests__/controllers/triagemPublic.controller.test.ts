import { beforeEach, describe, expect, it, jest } from "@jest/globals";
jest.mock("../../services/triagemIA.service", () => ({
  rodarTriagemIA: jest.fn(),
}));

import { triagemPublicHandler } from "../../controllers/triagemPublic.controller.js";
import { rodarTriagemIA } from "../../services/triagemIA.service.js";
import { mockReq, mockRes } from "../helpers/mockHttp.js";

const mockRodarTriagem: any = rodarTriagemIA;

describe("triagemPublic.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 400 quando a mensagem não for enviada", async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();

    await triagemPublicHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Campo 'mensagem' é obrigatório e deve ser string.",
    });
  });

  it("deve retornar 400 quando a mensagem não for string", async () => {
    const req = mockReq({ body: { mensagem: 123 } });
    const res = mockRes();

    await triagemPublicHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Campo 'mensagem' é obrigatório e deve ser string.",
    });
  });

  it("deve retornar 400 quando a mensagem for muito longa", async () => {
    const req = mockReq({ body: { mensagem: "a".repeat(2001) } });
    const res = mockRes();

    await triagemPublicHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Mensagem muito longa. Por favor, resuma o que está sentindo.",
    });
  });

  it("deve retornar o resultado da IA com sucesso", async () => {
    const resultado = { risco: "baixo", orientacao: "Procure descansar" };
    mockRodarTriagem.mockResolvedValue(resultado);
    const req = mockReq({ body: { mensagem: "Estou ansioso" } });
    const res = mockRes();

    await triagemPublicHandler(req, res);

    expect(mockRodarTriagem).toHaveBeenCalledWith("Estou ansioso");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resultado);
  });

  it("deve retornar 500 quando o serviço falhar", async () => {
    mockRodarTriagem.mockRejectedValue(new Error("falha"));
    const req = mockReq({ body: { mensagem: "Estou ansioso" } });
    const res = mockRes();

    await triagemPublicHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "Não consegui processar sua mensagem agora. Tente novamente em alguns instantes.",
    });
  });
});
