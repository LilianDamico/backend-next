import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 Erro interno:", err);
  res.status(500).json({
    error: "Erro interno do servidor",
    message: err?.message || "Algo deu errado.",
  });
};
