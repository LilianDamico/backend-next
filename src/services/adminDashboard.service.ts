// src/services/adminDashboard.service.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

// helper pra período do dia
function getPeriod(date: Date): "Manhã" | "Tarde" | "Noite" {
  const h = date.getHours();
  if (h < 12) return "Manhã";
  if (h < 18) return "Tarde";
  return "Noite";
}

// mapeia status interno da consulta (ajuste pro que tiver no seu schema)
function mapStatus(status: string): "Confirmado" | "Pendente" | "Cancelado" {
  switch (status) {
    case "CONFIRMADA":
    case "CONFIRMADO":
      return "Confirmado";
    case "CANCELADA":
    case "CANCELADO":
      return "Cancelado";
    default:
      return "Pendente";
  }
}

export async function getAdminDashboardData(): Promise<AdminDashboardDTO> {
  const now = new Date();

  // =======================
  //  Próximos agendamentos
  // =======================
  // 🔴 IMPORTANTE: ajuste os nomes dos campos para bater com seu modelo Consulta!
  const upcomingConsults = await prisma.consulta.findMany({
    where: {
      dataHora: { gte: now }, // se no seu schema for outro nome, troque aqui
    },
    include: {
      cliente: {
        select: { nome: true },
      },
    },
    orderBy: { dataHora: "asc" },
    take: 5,
  });

  const appointments: AdminAppointment[] = upcomingConsults.map((c) => {
    const d = c.dataHora as unknown as Date;
    const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return {
      time,
      period: getPeriod(d),
      patient: (c as any).cliente?.nome ?? "Paciente",
      status: mapStatus((c as any).status ?? "PENDENTE"),
    };
  });

  // =======================
//  Receita do mês
// =======================
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

const pagamentos = await prisma.pagamento.findMany({
  where: {
    status: "PAGO", // tem que bater com o texto que você grava no banco
    criadoEm: {
      gte: startOfMonth,
      lte: endOfMonth,
    },
  },
});

const currentMonth = pagamentos.reduce(
  (sum, p) => sum + Number(p.valor || 0),
  0
);

const goal = 22000; // depois isso pode vir de config/tabela
const percent = Math.round((currentMonth / goal) * 100);

const revenue: AdminRevenue = {
  currentMonth,
  goal,
  percent: Math.min(percent, 999),
};


  // =======================
  //  Engajamento
  // =======================
  // 🔴 Aqui eu usei Avaliação como "feedback". Ajuste os nomes pra seu schema.
  let feedbackCollected = 0;
  try {
    const feedbackCount = await prisma.avaliacao.count();
    feedbackCollected = feedbackCount;
  } catch {
    feedbackCollected = 0;
  }

  // Por enquanto deixo 0 – se você tiver tabelas tipo Postagem, ChatbotSession, é só trocar.
  const engagement: AdminEngagement = {
    feedbackCollected,
    communityPosts: 0,
    chatbotSessions: 0,
  };

  // =======================
  //  Satisfação (rating médio)
  // =======================
  let average = 0;
  let totalRatings = 0;

  try {
    const agg = await prisma.avaliacao.aggregate({
      _avg: { nota: true }, // ajuste se o campo não for "nota"
      _count: { _all: true },
    });

    average = Number(agg._avg.nota ?? 0);
    totalRatings = agg._count._all ?? 0;
  } catch {
    average = 0;
    totalRatings = 0;
  }

  const satisfaction: AdminSatisfaction = {
    average: Number(average.toFixed(1)),
    totalRatings,
  };

  return {
    appointments,
    revenue,
    engagement,
    satisfaction,
  };
}
