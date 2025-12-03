import type { Request, Response, NextFunction } from "express";

export function permitirRoles(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    const { tipo, roles } = req.user;

    // 1) Se existir roles no token (futuro), usa elas
    const possuiRoleArray = roles?.some((r) => rolesPermitidos.includes(r));

    // 2) Sempre validar pelo 'tipo' do usuário (ADMIN, CLIENTE, PROFISSIONAL)
    const possuiTipo = rolesPermitidos.includes(tipo);

    if (!possuiRoleArray && !possuiTipo) {
      res.status(403).json({
        error: "Acesso negado. Permissão insuficiente.",
        permitido: rolesPermitidos,
        recebido: { tipo, roles },
      });
      return;
    }

    next();
  };
}

