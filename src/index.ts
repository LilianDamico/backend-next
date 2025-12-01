// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { requestLogger } from "./middleware/requestLogger";

// Rotas
import userRoutes from "./routes/user.routes";
import clinicaRoutes from "./routes/clinica.routes";
import consultaRoutes from "./routes/consulta.routes";
import pagamentoRoutes from "./routes/pagamento.routes";
import avaliacaoRoutes from "./routes/avaliacao.routes";
import authRoutes from "./routes/auth.routes";
import profissionalRoutes from "./routes/profissional.routes";
import agendaRoutes from "./routes/agenda.routes";
import prescricaoRoutes from "./routes/prescricao.routes";
import prontuarioRoutes from "./routes/prontuario.routes";
import publicRoutes from "./routes/public.routes";
import calendarioProfissionalRoutes from "./routes/calendarioProfissional.routes";
import horarios from "./routes/horario.routes";
import lgpdRoutes from "./routes/lgpd.routes";

dotenv.config();
const app = express();

/* ============================================================
   ✅ CORS PROFISSIONAL e correto
   ============================================================ */

// Domínios reais permitidos
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",

  // Frontend Vercel REAL (ajuste AQUI)
  "https://mind-care-4d54jqcgqg-lilians-projects-162305f6.vercel.app",

  // Backend Render (caso teste no navegador)
  "https://backend-next-het9.onrender.com",

  // IA FastAPI (opcional)
  "https://mindcare-ai-ylk7.onrender.com",
];

// Middleware 100% seguro
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") return res.sendStatus(200);

  next();
});

// ❗ REMOVIDO O CORS DUPLICADO → EVITA CONFLITO
// app.use(cors({ origin: allowedOrigins, credentials: true }));

/* ============================================================
   BODY PARSER + LOGGER
   ============================================================ */
app.use(express.json());
app.use(requestLogger);

/* ============================================================
   ROTAS
   ============================================================ */
app.use("/api/users", userRoutes);
app.use("/api/clinicas", clinicaRoutes);
app.use("/api/consultas", consultaRoutes);
app.use("/api/pagamentos", pagamentoRoutes);
app.use("/api/avaliacoes", avaliacaoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profissional", profissionalRoutes);
app.use("/api/agenda", agendaRoutes);
app.use("/api/prescricao", prescricaoRoutes);
app.use("/api/prontuarios", prontuarioRoutes);
app.use("/public", publicRoutes);
app.use("/api/calendario", calendarioProfissionalRoutes);
app.use("/api/horarios", horarios);
app.use("/api/lgpd", lgpdRoutes);

/* ============================================================
   404
   ============================================================ */
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

/* ============================================================
   GLOBAL ERROR HANDLER
   ============================================================ */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ ERRO INTERNO:", err);
  res.status(500).json({ error: "Erro interno no servidor." });
});

/* ============================================================
   START SERVER
   ============================================================ */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
