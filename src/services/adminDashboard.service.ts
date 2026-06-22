// src/services/adminDashboard.service.ts
import { StatusConsulta } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";

type PagamentoRow = { valor: number | bigint | null; status: string };

export type AdminAppointment = {
  time: string;
  period: "Manhã" | "Tarde" | "Noite";
  patient: string;
  status: "Confirmado" | "Pendente" | "Cancelado";
};

export type AdminRevenue = {
  currentMonth: number;
  goal: number;
  percent: number;
};

export type AdminEngagement = {
  feedbackCollected: number;
  communityPosts: number;
  chatbotSessions: number;
};

export type AdminSatisfaction = {
  average: number;
  totalRatings: number;
};

export type AdminDashboardDTO = {
  appointments: AdminAppointment[];
  revenue: AdminRevenue;
  engagement: AdminEngagement;
  satisfaction: AdminSatisfaction;
};

// helper: período do dia
function getPeriod(date: Date): "Manhã" | "Tarde" | "Noite" {
  const h = date.getHours();
  if (h < 12) return "Manhã";
  if (h < 18) return "Tarde";
  return "Noite";
}

// helper: traduz status interno para o dashboard
function mapStatus(status: StatusConsulta | null): "Confirmado" | "Pendente" | "Cancelado" {
  switch (status) {
    case "CONCLUIDA":
      return "Confirmado";
    case "CANCELADA":
      return "Cancelado";
    case "AGENDADA":
    default:
      return "Pendente";
  }
}

export async function getAdminDashboardData(): Promise<AdminDashboardDTO> {
  const now = new Date();

  // ==========================================================
  // 🔵 1. BUSCAR PRÓXIMAS CONSULTAS FUTURAS
  // ==========================================================
  const nextConsults = await prisma.consulta.findMany({
    where: {
      dataHora: { gte: now },
      status: StatusConsulta.AGENDADA,
    },
    orderBy: { dataHora: "asc" },
    take: 5,
    include: {
      cliente: { select: { nome: true } },
    },
  });

  const appointments: AdminAppointment[] = nextConsults.map((c) => {
    const d = c.dataHora as Date;
    const time = d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      time,
      period: getPeriod(d),
      patient: c.cliente?.nome ?? "Paciente",
      status: mapStatus(c.status),
    };
  });

  // ==========================================================
  // 🔵 2. RECEITA DO MÊS (placeholder até métodos de pagamento existirem)
  // ==========================================================
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const pagamentos = await prisma.pagamento.findMany({
    where: {
      status: "PAGO",
      criadoEm: { gte: startOfMonth, lte: endOfMonth },
    },
  });

  const currentMonth = pagamentos.reduce((sum: number, p: PagamentoRow) => sum + Number(p.valor ?? 0), 0);
  const goal = 22000;
  const percent = Math.round((currentMonth / goal) * 100);

  const revenue: AdminRevenue = {
    currentMonth,
    goal,
    percent: Math.min(percent, 999),
  };

  // ==========================================================
  // 🔵 3. ENGAJAMENTO (placeholder seguro)
  // ==========================================================
  let feedbackCollected = 0;
  try {
    feedbackCollected = await prisma.avaliacao.count();
  } catch {
    feedbackCollected = 0;
  }

  const engagement: AdminEngagement = {
    feedbackCollected,
    communityPosts: 0,
    chatbotSessions: 0,
  };

  // ==========================================================
  // 🔵 4. SATISFAÇÃO
  // ==========================================================
  const agg = await prisma.avaliacao.aggregate({
    _avg: { nota: true },
    _count: { _all: true },
  });

  const average = Number(agg._avg.nota ?? 0);
  const totalRatings = agg._count._all ?? 0;

  const satisfaction: AdminSatisfaction = {
    average: Number(average.toFixed(1)),
    totalRatings,
  };

  // ==========================================================
  // 🔵 RETORNO FINAL — compatível com o dashboard do frontend
  // ==========================================================
  return {
    appointments,
    revenue,
    engagement,
    satisfaction,
  };
}
