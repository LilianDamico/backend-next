declare namespace Express {
  export interface UserPayload {
    id: string;
    nome: string;
    email: string;
    tipo: string;
  }

  export interface Request {
    user?: UserPayload;
  }
}
