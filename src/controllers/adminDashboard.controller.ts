import { Request, Response } from "express";
import { getAdminDashboardData } from "../services/adminDashboard.service";

export async function adminDashboardController(req: Request, res: Response) {
  try {
    const data = await getAdminDashboardData();

    return res.json({
      sucesso: true,
      painel: data,
    });

  } catch (err: any) {
    console.error("Erro no AdminDashboardController:", err);

    return res.status(500).json({
      sucesso: false,
      error: "Erro ao carregar dados do painel administrativo.",
      detalhes: err?.message,
    });
  }
}
