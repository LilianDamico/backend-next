import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
  cpf: string;
  tipo?: string;
}

export const autenticarJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
    if (!decoded.id || !decoded.email) {
      res.status(403).json({ error: "Token inválido." });
      return;
    }

    (req as any).user = decoded;
    next();
  } catch {
    res.status(403).json({ error: "Token inválido ou expirado." });
  }
};
