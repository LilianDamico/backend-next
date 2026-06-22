import { jest } from "@jest/globals";
import { rodarTriagemIA } from "../../services/triagemIA.service.js";

// Variável definida antes do mock para ser acessível via closure lazy.
// A factory do jest.mock é hoisted, mas a função interna só é chamada
// durante a execução do teste — depois que mockCreate for inicializado.
let mockCreate: jest.Mock<any>;

jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        // Closure lazy: acessa mockCreate no momento da chamada, não da criação
        create: (...args: any[]) => mockCreate(...args),
      },
    },
  }));
});

describe("triagemIA.service — rodarTriagemIA", () => {
  beforeEach(() => {
    mockCreate = jest.fn();
    process.env.OPENAI_API_KEY = "test-key";
  });

  const makeCompletion = (content: string) => ({
    choices: [{ message: { content } }],
  });

  it("deve retornar resultado de triagem válido", async () => {
    const resultado = { risco: "risco_baixo", resposta: "Tudo bem, conte mais.", acao: "continuar" };
    mockCreate.mockResolvedValue(makeCompletion(JSON.stringify(resultado)));

    const res = await rodarTriagemIA("Estou me sentindo um pouco ansioso.");

    expect(res.risco).toBe("risco_baixo");
    expect(res.resposta).toBe("Tudo bem, conte mais.");
    expect(res.acao).toBe("continuar");
  });

  it("deve extrair JSON mesmo quando a IA retorna texto extra ao redor", async () => {
    const json = { risco: "risco_moderado", resposta: "Entendo você.", acao: "sugerir_agendamento" };
    mockCreate.mockResolvedValue(makeCompletion(`Aqui está a resposta: ${JSON.stringify(json)} fim.`));

    const res = await rodarTriagemIA("Estou muito triste.");

    expect(res.risco).toBe("risco_moderado");
    expect(res.acao).toBe("sugerir_agendamento");
  });

  it("deve lançar erro quando a IA retorna conteúdo vazio", async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: null } }] });

    await expect(rodarTriagemIA("mensagem")).rejects.toThrow("Resposta vazia da IA na triagem.");
  });

  it("deve lançar erro quando a IA retorna JSON inválido", async () => {
    mockCreate.mockResolvedValue(makeCompletion("isso nao e json"));

    await expect(rodarTriagemIA("mensagem")).rejects.toThrow("Falha ao interpretar resposta da IA.");
  });

  it("deve lançar erro quando o JSON da IA está incompleto (falta campos obrigatórios)", async () => {
    mockCreate.mockResolvedValue(makeCompletion(JSON.stringify({ risco: "risco_alto" })));

    await expect(rodarTriagemIA("mensagem")).rejects.toThrow("Resposta da IA incompleta na triagem.");
  });

  it("deve lançar erro quando a IA direciona para emergência sem resposta", async () => {
    mockCreate.mockResolvedValue(
      makeCompletion(JSON.stringify({ risco: "risco_alto", acao: "direcionar_emergencia" }))
    );

    await expect(rodarTriagemIA("quero me machucar")).rejects.toThrow("Resposta da IA incompleta na triagem.");
  });
});
