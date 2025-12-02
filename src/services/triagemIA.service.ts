// src/services/triagemIA.service.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  console.warn("[TriagemIA] OPENAI_API_KEY não definida no .env");
}

export type TriagemRisco = "risco_baixo" | "risco_moderado" | "risco_alto";

export type TriagemAcao =
  | "continuar"
  | "sugerir_agendamento"
  | "direcionar_emergencia";

export interface TriagemResult {
  risco: TriagemRisco;
  resposta: string;
  acao: TriagemAcao;
}

const SYSTEM_PROMPT = `
Você é o Assistente de Triagem Emocional do MindCare.
Você atende pessoas ANÔNIMAS, sem login e sem cadastro.

Sua função:
- acolher
- identificar nível de risco emocional
- orientar de forma ética e segura

Classifique a mensagem em:
- "risco_baixo"
- "risco_moderado"
- "risco_alto"

Defina também uma ação:
- "continuar"              → quando é desabafo leve, conversa pode seguir
- "sugerir_agendamento"    → quando há sofrimento relevante, mas sem risco imediato
- "direcionar_emergencia"  → quando há ideação suicida, automutilação, risco iminente

Regras importantes:
1. NÃO peça nome, telefone, localização ou dados pessoais.
2. NÃO dê diagnóstico médico ou psiquiátrico.
3. Em "risco_alto", SEMPRE oriente a buscar ajuda imediata (ex: CVV 188, pronto-socorro).
4. Seja acolhedor, direto e humano, em até 2 frases curtas.
5. Responda SEMPRE SOMENTE com JSON válido no formato:

{
  "risco": "risco_baixo" | "risco_moderado" | "risco_alto",
  "resposta": "texto para o usuário",
  "acao": "continuar" | "sugerir_agendamento" | "direcionar_emergencia"
}
`.trim();

export async function rodarTriagemIA(
  mensagem: string
): Promise<TriagemResult> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: mensagem },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Resposta vazia da IA na triagem.");
  }

  let parsed: TriagemResult;

  try {
    // Garantia se vier alguma coisa extra além do JSON
    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}");
    const jsonString = content.slice(jsonStart, jsonEnd + 1);

    parsed = JSON.parse(jsonString);
  } catch (err) {
    console.error("[TriagemIA] Erro ao fazer parse do JSON:", content);
    throw new Error("Falha ao interpretar resposta da IA.");
  }

  // Hardening mínimo
  if (!parsed.risco || !parsed.resposta || !parsed.acao) {
    throw new Error("Resposta da IA incompleta na triagem.");
  }

  return parsed;
}
