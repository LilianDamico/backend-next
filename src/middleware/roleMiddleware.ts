import { Request, Response, NextFunction } from "express";

export function allowRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Token não enviado" });
    }

    if (!roles.includes(user.tipo)) {
      return res.status(403).json({ error: "Acesso negado." });
    }

    next();
  };
}
