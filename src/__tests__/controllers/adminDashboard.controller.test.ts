import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mockReq, mockRes } from "../helpers/mockHttp.js";

const mockGetAdminDashboardData = jest.fn();

jest.unstable_mockModule("../../services/adminDashboard.service.js", () => ({
  getAdminDashboardData: mockGetAdminDashboardData,
}));

const { adminDashboardController } = await import("../../controllers/adminDashboard.controller.js");

describe("adminDashboard.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar os dados do painel com sucesso", async () => {
    const data = { usuarios: 10, faturamento: 2000 };
    mockGetAdminDashboardData.mockResolvedValue(data as any);
    const req = mockReq();
    const res = mockRes();

    await adminDashboardController(req, res);

    expect(mockGetAdminDashboardData).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      sucesso: true,
      painel: data,
    });
  });

  it("deve retornar 500 quando o serviço falhar", async () => {
    mockGetAdminDashboardData.mockRejectedValue(new Error("falha no serviço"));
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
