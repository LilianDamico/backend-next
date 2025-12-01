// src/controllers/lgpd.controller.ts
import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { VERSAO_LGPD, ARQUIVO_LGPD } from "../lgpd/versaoLGPD";

function hashIP(ip: string) {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

// ----------------------------
// 1) Registrar consentimento
// ----------------------------
export const registrarConsentimento = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "Não autenticado." });

  const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "0.0.0.0";

  const novo = await prisma.consentimento.create({
    data: {
      userId: user.id,
      aceito: true,
      metodo: "web",
      ip,
      hashIp: hashIP(ip),
      versao: VERSAO_LGPD,
      origem: ARQUIVO_LGPD,
      expiraEm: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000) // ~24 meses
    }
  });

  return res.status(201).json({
    message: "Consentimento registrado com sucesso.",
    consentimento: novo
  });
};

// ----------------------------
// 2) Revogar consentimento
// ----------------------------
export const revogarConsentimento = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "Não autenticado." });

  const registro = await prisma.consentimento.create({
    data: {
      userId: user.id,
      aceito: false,
      metodo: "revogado",
      versao: VERSAO_LGPD,
      origem: ARQUIVO_LGPD
    }
  });

  return res.json({
    message: "Consentimento revogado.",
    consentimento: registro
  });
};

// ----------------------------
// 3) Status atual (último registro)
// ----------------------------
export const statusConsentimento = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "Não autenticado." });

  const ultimo = await prisma.consentimento.findFirst({
    where: { userId: user.id },
    orderBy: { criadoEm: "desc" }
  });

  if (!ultimo) {
    return res.json({
      status: "ausente",
      versaoAtual: VERSAO_LGPD
    });
  }

  const agora = new Date();
  const expirado = ultimo.expiraEm && ultimo.expiraEm < agora;

  const status =
    ultimo.aceito && !expirado ? "ativo" :
    !ultimo.aceito              ? "revogado" :
    expirado                    ? "expirado" :
                                  "ausente";

  return res.json({
    status,
    versaoAtual: VERSAO_LGPD,
    ultimo
  });
};

// ----------------------------
// 4) Histórico completo
// ----------------------------
export const historicoConsentimentos = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "Não autenticado." });

  const registros = await prisma.consentimento.findMany({
    where: { userId: user.id },
    orderBy: { criadoEm: "desc" }
  });

  return res.json({ registros });
};

// ----------------------------
// 5) Export JSON
// ----------------------------
export const exportarDadosJson = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "Não autenticado." });

  const dados = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      consultasComoCliente: {
        include: { prontuarios: true }
      },
      consultasComoProfissional: true,
      prescricoesRecebidas: true,
      prescricoesFeitas: true,
      calendarios: true,
      consentimentos: true
    }
  });

  return res
    .setHeader("Content-Type", "application/json")
    .send(JSON.stringify(dados, null, 2));
};

// ----------------------------
// 6) Export PDF (placeholder IA)
// ----------------------------
export const exportarDadosPdf = async (req: Request, res: Response) => {
  // aqui no futuro você pluga a IA pra montar PDF bonitão
  return res.send("Exportação PDF com IA será adicionada em breve.");
};

// ----------------------------
// 7) Excluir conta (soft delete)
// ----------------------------
export const excluirConta = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "Não autenticado." });

  await prisma.user.update({
    where: { id: user.id },
    data: { deletado: true }
  });

  return res.json({ message: "Conta marcada como excluída." });
};
