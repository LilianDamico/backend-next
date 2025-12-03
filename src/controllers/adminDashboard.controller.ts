// src/controllers/adminDashboard.controller.ts
import { Request, Response } from "express";
import { getAdminDashboardData } from "../services/adminDashboard.service";

export async function getAdminDashboard(req: Request, res: Response) {
  try {
    const data = await getAdminDashboardData();
    return res.json(data);
  } catch (error) {
    console.error("Erro ao carregar dashboard do admin:", error);
    return res.status(500).json({ error: "Erro ao carregar dados do painel do administrador." });
  }
}
