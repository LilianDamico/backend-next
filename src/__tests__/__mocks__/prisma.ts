import { jest } from "@jest/globals";

// Mock global do Prisma — usado via moduleNameMapper no jest.config.ts
// Todos os métodos são jest.fn() para permitir .mockResolvedValue() nos testes

const makeCrud = () => ({
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  aggregate: jest.fn(),
  upsert: jest.fn(),
});

export const prisma = {
  user: makeCrud(),
  consulta: makeCrud(),
  calendarioProfissional: makeCrud(),
  avaliacao: makeCrud(),
  pagamento: makeCrud(),
  prontuario: makeCrud(),
  prescricao: makeCrud(),
  consentimento: makeCrud(),
  clinica: makeCrud(),
  pesquisaSatisfacao: makeCrud(),
};

// Enums e tipos usados em services e controllers importados de @prisma/client
export const StatusConsulta = {
  AGENDADA: "AGENDADA",
  CANCELADA: "CANCELADA",
  CONCLUIDA: "CONCLUIDA",
} as const;

export type Pagamento = {
  id: string;
  valor: number | null;
  status: string;
  criadoEm: Date;
  [key: string]: unknown;
};
