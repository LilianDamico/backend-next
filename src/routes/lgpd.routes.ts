import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

/**
 * POST /api/lgpd/consentimento
 * Registra um aceite de LGPD vinculado a um usuário
 */
router.post("/consentimento", async (req, res) => {
  try {
    const { userId, versao, origem, ip } = req.body;

    // ============================================================
    // 1️⃣ VALIDAÇÕES
    // ============================================================
    if (!userId || !versao || !origem) {
      return res.status(400).json({
        error: "Campos obrigatórios ausentes: userId, versao ou origem."
      });
    }

    // IP opcional — se não vier, tentamos pegar do request
    const ipRegistrado =
      ip ||
      req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      null;

    // Hash seguro do IP
    const hashIp = ipRegistrado
      ? Buffer.from(ipRegistrado).toString("base64")
      : null;

    // ============================================================
    // 2️⃣ CRIAÇÃO DO REGISTRO
    // ============================================================
    const novo = await prisma.consentimento.create({
      data: {
        userId,
        aceito: true,
        metodo: "web",
        ip: ipRegistrado,
        hashIp,
        versao,
        origem,
        expiraEm: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 24 meses
      },
    });

    // ============================================================
    // 3️⃣ RETORNO
    // ============================================================
    return res.status(201).json({
      message: "LGPD registrado com sucesso",
      registro: novo,
    });

  } catch (e: any) {
    console.error("🔥 Erro ao registrar LGPD:", e);

    return res.status(500).json({
      error: "Erro interno ao registrar consentimento.",
      detalhe: e?.message || e
    });
  }
});

export default router;
