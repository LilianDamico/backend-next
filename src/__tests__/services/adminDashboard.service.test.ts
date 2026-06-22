import { jest } from "@jest/globals";
import { getAdminDashboardData } from "../../services/adminDashboard.service.js";
import { prisma } from "../../lib/prisma.js";

describe("adminDashboard.service — getAdminDashboardData", () => {
  beforeEach(() => jest.clearAllMocks());

  const mockConsultas = [
    {
      dataHora: new Date("2030-01-01T08:30:00"),
      status: "AGENDADA",
      cliente: { nome: "Ana Silva" },
    },
    {
      dataHora: new Date("2030-01-01T14:00:00"),
      status: "AGENDADA",
      cliente: { nome: "Carlos Lima" },
    },
    {
      dataHora: new Date("2030-01-01T20:00:00"),
      status: "CANCELADA",
      cliente: null,
    },
  ];

  const mockPagamentos = [
    { valor: 150.0, status: "PAGO" },
    { valor: 200.0, status: "PAGO" },
  ];

  const mockAggregate = { _avg: { nota: 4.5 }, _count: { _all: 10 } };

  function setupMocks() {
    (prisma.consulta.findMany as jest.Mock<any>).mockResolvedValue(mockConsultas);
    (prisma.pagamento.findMany as jest.Mock<any>).mockResolvedValue(mockPagamentos);
    (prisma.avaliacao.count as jest.Mock<any>).mockResolvedValue(10);
    (prisma.avaliacao.aggregate as jest.Mock<any>).mockResolvedValue(mockAggregate);
  }

  it("deve retornar os dados do dashboard com a estrutura correta", async () => {
    setupMocks();

    const data = await getAdminDashboardData();

    expect(data).toHaveProperty("appointments");
    expect(data).toHaveProperty("revenue");
    expect(data).toHaveProperty("engagement");
    expect(data).toHaveProperty("satisfaction");
  });

  it("deve mapear consultas como appointments com time, period, patient e status", async () => {
    setupMocks();

    const data = await getAdminDashboardData();

    expect(data.appointments.length).toBeGreaterThan(0);
    const apt = data.appointments[0];
    expect(apt).toHaveProperty("time");
    expect(apt).toHaveProperty("period");
    expect(apt).toHaveProperty("patient");
    expect(apt).toHaveProperty("status");
  });

  it("deve classificar período como Manhã para horários antes das 12h", async () => {
    setupMocks();
    const data = await getAdminDashboardData();
    expect(data.appointments[0].period).toBe("Manhã");
  });

  it("deve classificar período como Tarde para horários entre 12h e 18h", async () => {
    setupMocks();
    const data = await getAdminDashboardData();
    expect(data.appointments[1].period).toBe("Tarde");
  });

  it("deve classificar período como Noite para horários após 18h", async () => {
    setupMocks();
    const data = await getAdminDashboardData();
    expect(data.appointments[2].period).toBe("Noite");
  });

  it("deve calcular a receita do mês corretamente", async () => {
    setupMocks();
    const data = await getAdminDashboardData();

    expect(data.revenue.currentMonth).toBe(350);
    expect(data.revenue.goal).toBe(22000);
    expect(data.revenue.percent).toBeGreaterThanOrEqual(0);
  });

  it("deve retornar satisfação com média e total de avaliações", async () => {
    setupMocks();
    const data = await getAdminDashboardData();

    expect(data.satisfaction.average).toBe(4.5);
    expect(data.satisfaction.totalRatings).toBe(10);
  });

  it("deve retornar feedbackCollected no engagement", async () => {
    setupMocks();
    const data = await getAdminDashboardData();

    expect(data.engagement.feedbackCollected).toBe(10);
  });

  it("deve usar 'Paciente' como nome quando cliente é null", async () => {
    setupMocks();
    const data = await getAdminDashboardData();
    const semCliente = data.appointments.find((a) => a.patient === "Paciente");
    expect(semCliente).toBeDefined();
  });

  it("deve mapear status CANCELADA → 'Cancelado'", async () => {
    setupMocks();
    const data = await getAdminDashboardData();
    const cancelado = data.appointments.find((a) => a.status === "Cancelado");
    expect(cancelado).toBeDefined();
  });
});
