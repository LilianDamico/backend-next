import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { requestLogger } from "./middleware/requestLogger";
import { Request, Response, NextFunction } from "express";

import userRoutes from "./routes/user.routes";
import clinicaRoutes from "./routes/clinica.routes";
import consultaRoutes from "./routes/consulta.routes";
import pagamentoRoutes from "./routes/pagamento.routes";
import avaliacaoRoutes from "./routes/avaliacao.routes";
import authRoutes from "./routes/auth.routes";
import horarioRoutes from "./routes/horario.routes";
import profissionalRoutes from "./routes/profissional.routes";
import agendaRoutes from "./routes/agenda.routes";
import prescricaoRoutes from "./routes/prescricao.routes";
import prontuarioRoutes from "./routes/prontuario.routes";
import publicRoutes from "./routes/public.routes";
import calendarioProfissionalRoutes from "./routes/calendarioProfissional.routes";

dotenv.config();
const app = express();

// =================== CORS ======================

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

// =================== JSON ======================
app.use(express.json());
app.use(requestLogger);

// =================== ROTAS ======================
app.use("/api/users", userRoutes);
app.use("/api/clinicas", clinicaRoutes);
app.use("/api/consultas", consultaRoutes);
app.use("/api/pagamentos", pagamentoRoutes);
app.use("/api/avaliacoes", avaliacaoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/horarios", horarioRoutes);
app.use("/api/profissional", profissionalRoutes);
app.use("/api/agenda", agendaRoutes);
app.use("/api/prescricao", prescricaoRoutes);
app.use("/api/prontuarios", prontuarioRoutes);
app.use("/public", publicRoutes);
app.use("/api/calendario", calendarioProfissionalRoutes);

// =============== 404 ==================
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

// =============== ERRO GLOBAL ==========
app.use(
  (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error("❌ ERRO INTERNO:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
);

// =============== SERVER ===============
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
