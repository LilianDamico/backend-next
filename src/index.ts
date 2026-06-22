// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger.js";
import { requestLogger } from "./middleware/requestLogger.js";

// Rotas
import userRoutes from "./routes/user.routes.js";
import clinicaRoutes from "./routes/clinica.routes.js";
import consultaRoutes from "./routes/consulta.routes.js";
import pagamentoRoutes from "./routes/pagamento.routes.js";
import avaliacaoRoutes from "./routes/avaliacao.routes.js";
import authRoutes from "./routes/auth.routes.js";
import profissionalRoutes from "./routes/profissional.routes.js";
import agendaRoutes from "./routes/agenda.routes.js";
import prescricaoRoutes from "./routes/prescricao.routes.js";
import prontuarioRoutes from "./routes/prontuario.routes.js";
import publicRoutes from "./routes/public.routes.js";
import calendarioProfissionalRoutes from "./routes/calendarioProfissional.routes.js";
import horarios from "./routes/horario.routes.js";
import lgpdRoutes from "./routes/lgpd.routes.js";
import adminDashboardRoutes from "./routes/adminDashboard.routes.js"

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL: JWT_SECRET não definido nas variáveis de ambiente. Encerrando.");
  process.exit(1);
}

const app = express();

/* ============================================================
   ✅ CORS DEFINITIVO (Vercel + Localhost + Render)
   ============================================================ */
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",

  // FRONTEND DE PRODUÇÃO REAL
  "https://mind-care-steel.vercel.app",

  // BACKEND Render — apenas debug via browser
  "https://backend-next-het9.onrender.com",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    console.warn("🚫 Origem bloqueada pelo CORS:", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") return res.sendStatus(200);

  return next();
});

app.use(express.json());
app.use(requestLogger);

/* ============================================================
   SWAGGER — Documentação Interativa
   ============================================================ */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "MindCare API Docs",
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: "list",
    filter: true,
    tryItOutEnabled: true,
  },
}));

/* ============================================================
   ROTAS
   ============================================================ */
app.use("/api/users", userRoutes);
app.use("/api/clinicas", clinicaRoutes);
app.use("/api/consultas", consultaRoutes);
app.use("/api/pagamentos", pagamentoRoutes);
app.use("/api/avaliacao", avaliacaoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profissional", profissionalRoutes);
app.use("/api/agenda", agendaRoutes);
app.use("/api/prescricao", prescricaoRoutes);
app.use("/api/prontuarios", prontuarioRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/calendario", calendarioProfissionalRoutes);
app.use("/api/horarios", horarios);
app.use("/api/lgpd", lgpdRoutes);
app.use("/api/admin", adminDashboardRoutes);

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
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
