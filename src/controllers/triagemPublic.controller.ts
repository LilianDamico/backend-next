// src/controllers/triagemPublic.controller.ts
import { Request, Response } from "express";
import { rodarTriagemIA } from "../services/triagemIA.service";

export async function triagemPublicHandler(req: Request, res: Response) {
  try {
    const { mensagem } = req.body;

    if (!mensagem || typeof mensagem !== "string") {
      return res.status(400).json({
        error: "Campo 'mensagem' é obrigatório e deve ser string.",
      });
    }

    // Opcional: limitar tamanho de mensagem
    if (mensagem.length > 2000) {
      return res.status(400).json({
        error: "Mensagem muito longa. Por favor, resuma o que está sentindo.",
      });
    }

    const resultado = await rodarTriagemIA(mensagem);

    // Aqui você poderia logar MÉTRICAS anônimas (sem texto)
    // ex: risco, data, ip hash, etc.

    return res.status(200).json(resultado);
  } catch (err) {
    console.error("[TriagemPublic] Erro na triagem:", err);

    return res.status(500).json({
      error:
        "Não consegui processar sua mensagem agora. Tente novamente em alguns instantes.",
    });
  }
}
