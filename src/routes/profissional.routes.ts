import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  getPerfilProfissional,
  atualizarPerfilProfissional,
  listarHorariosDoProfissional,
  criarOuAtualizarHorario,
  listarConsultasAgendadas,
} from "../controllers/profissional.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// ============================================================
// 🔹 PERFIL / AGENDA PRIVADA (SOMENTE PROFISSIONAL LOGADO)
// ============================================================
router.get("/me", authMiddleware, getPerfilProfissional);
router.put("/me", authMiddleware, atualizarPerfilProfissional);
router.get("/agenda", authMiddleware, listarHorariosDoProfissional);
router.post("/agenda", authMiddleware, criarOuAtualizarHorario);
router.get("/consultas", authMiddleware, listarConsultasAgendadas);

// ============================================================
// 🔹 LISTAR PROFISSIONAIS (PÚBLICO - usado pelo cliente)
// ============================================================
router.get("/", async (req: Request, res: Response) => {
  try {
    const { nome } = req.query;

    const profissionais = await prisma.user.findMany({
      where: {
        tipo: "PROFISSIONAL",
        nome: nome ? { contains: String(nome), mode: "insensitive" } : undefined,
      },
      select: {
        id: true,
        nome: true,
        especialidade: true,
        cidade: true,
      },
      orderBy: { nome: "asc" },
    });

    return res.json({ profissionais });
  } catch (error) {
    console.error("❌ Erro ao listar profissionais:", error);
    return res.status(500).json({
      message: "Erro ao buscar profissionais no banco de dados.",
    });
  }
});

// Alias opcional para compatibilidade com frontend legado
router.get("/buscar", async (req: Request, res: Response) => {
  try {
    const { nome } = req.query;
    const profissionais = await prisma.user.findMany({
      where: {
        tipo: "PROFISSIONAL",
        nome: nome ? { contains: String(nome), mode: "insensitive" } : undefined,
      },
      select: {
        id: true,
        nome: true,
        especialidade: true,
        cidade: true,
      },
      orderBy: { nome: "asc" },
    });
    return res.json({ profissionais });
  } catch (error) {
    console.error("❌ Erro em /buscar:", error);
    return res.status(500).json({ error: "Erro ao buscar profissionais" });
  }
});

// ============================================================
// 🔹 LISTAR HORÁRIOS PÚBLICOS POR NOME DO PROFISSIONAL
// ============================================================
//  ✔ Pode ser acessado por CLIENTE logado
//  ✔ Mostra horários disponíveis (sem exigir login do profissional)
// ============================================================
router.get("/horarios/:nome", async (req: Request, res: Response) => {
  try {
    const { nome } = req.params;

    const profissional = await prisma.user.findFirst({
      where: {
        nome: { equals: nome, mode: "insensitive" },
        tipo: "PROFISSIONAL",
      },
    });

    if (!profissional) {
      return res.status(404).json({ message: "Profissional não encontrado" });
    }

    const horarios = await prisma.horario.findMany({
      where: { profissionalId: profissional.id, disponivel: true },
      orderBy: { dataHora: "asc" },
      select: {
        id: true,
        dataHora: true,
        disponivel: true,
      },
    });

    if (horarios.length === 0) {
      return res.status(200).json([]); // retorna lista vazia em vez de erro
    }

    return res.json(horarios);
  } catch (error) {
    console.error("❌ Erro ao buscar horários:", error);
    return res
      .status(500)
      .json({ message: "Erro ao buscar horários do profissional" });
  }
});

export default router;
