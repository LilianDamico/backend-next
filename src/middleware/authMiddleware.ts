import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto"; // 🔐

export interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
  cpf: string;
  tipo: "ADMIN" | "CLIENTE" | "PROFISSIONAL" | "CLINICA";
}

/**
 * Middleware padrão — valida token
 */
export const autenticarJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Token não fornecido" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token malformatado" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;
    return next(); // OK 🔥
  } catch {
    return res.status(403).json({ error: "Token inválido ou expirado" });
  }
};


/**
 * Middleware RBAC — exige roles específicas
 */
export const roleRequired = (...roles: TokenPayload["tipo"][]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) return res.status(401).json({ error: "Token ausente" });

    // ❗ Se a role NÃO for autorizada → bloqueia
    if (!roles.includes(req.user.tipo)) {
      return res.status(403).json({
        error: `Acesso negado — necessário: ${roles.join(", ")}`,
        recebido: req.user.tipo
      });
    }

    return next(); // final feliz 😎
  };
};
