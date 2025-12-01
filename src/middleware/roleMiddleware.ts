import type { Request, Response, NextFunction } from "express";

export function permitirRoles(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    const possuiPapel = req.user.roles?.some((role) =>
      rolesPermitidos.includes(role)
    );

    if (!possuiPapel) {
      res.status(403).json({
        error: "Acesso negado. Permissão insuficiente.",
        permitido: rolesPermitidos,
      });
      return;
    }

    next();
  };
}
