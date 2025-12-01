import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

interface TokenPayload {
  id: string;
  email: string;
  cpf: string;
  tipo: "ADMIN" | "CLIENTE" | "PROFISSIONAL" | "CLINICA";
  roles?: string[];
}

export function autenticarJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Token não fornecido." });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Token malformado." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      cpf: decoded.cpf,
      tipo: decoded.tipo,
      roles: decoded.roles ?? [],
    };

    next();
  } catch (err) {
    res.status(403).json({ error: "Token inválido ou expirado." });
  }
}
