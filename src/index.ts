// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { requestLogger } from "./middleware/requestLogger";

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

// ======================================================
// CORS — backend em 8080, frontend em 3000
// ======================================================
const ALLOWED_ORIGIN = "http://localhost:3000";

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});


// (opcional, mas não atrapalha – deixa também)
app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true,
  })
);

// ======================================================
// BODY PARSER + LOGGER
// ======================================================
app.use(express.json());
app.use(requestLogger);

// ======================================================
// ROTAS
// ======================================================
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

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

// ERRO GLOBAL
app.use(
  (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("❌ ERRO INTERNO:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
