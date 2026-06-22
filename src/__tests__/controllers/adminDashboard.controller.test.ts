import { beforeEach, describe, expect, it, jest } from "@jest/globals";
jest.mock("../../services/adminDashboard.service", () => ({
  getAdminDashboardData: jest.fn(),
}));

import { adminDashboardController } from "../../controllers/adminDashboard.controller.js";
import { getAdminDashboardData } from "../../services/adminDashboard.service.js";
import { mockReq, mockRes } from "../helpers/mockHttp.js";

const mockGetData: any = getAdminDashboardData;

describe("adminDashboard.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar os dados do painel com sucesso", async () => {
    const data = { usuarios: 10, faturamento: 2000 };
    mockGetData.mockResolvedValue(data);
    const req = mockReq();
    const res = mockRes();

    await adminDashboardController(req, res);

    expect(mockGetData).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      sucesso: true,
      painel: data,
    });
  });

  it("deve retornar 500 quando o serviço falhar", async () => {
    mockGetData.mockRejectedValue(new Error("falha no serviço"));
    const req = mockReq();
    const res = mockRes();

    await adminDashboardController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      sucesso: false,
      error: "Erro ao carregar dados do painel administrativo.",
      detalhes: "falha no serviço",
    });
  });
});
