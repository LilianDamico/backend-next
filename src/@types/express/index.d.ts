import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email: string;
      cpf: string;
      tipo: "ADMIN" | "CLIENTE" | "PROFISSIONAL" | "CLINICA"; // roles oficiais
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
