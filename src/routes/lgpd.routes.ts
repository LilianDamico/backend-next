import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.post("/consentimento", async (req, res) => {
  try {
    const { userId, versao, origem, ip } = req.body;

    const novo = await prisma.consentimento.create({
      data: {
        userId,
        aceito: true,
        metodo: "web",
        ip,
        hashIp: ip ? Buffer.from(ip).toString("base64") : null,
        versao,
        origem,
        expiraEm: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 24 meses
      },
    });

    return res.status(201).json({ message: "LGPD registrado", novo });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

export default router;
