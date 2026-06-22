import { VERSAO_LGPD, ARQUIVO_LGPD } from "../../lgpd/versaoLGPD.js";

describe("versaoLGPD", () => {
  it("deve exportar VERSAO_LGPD como string não vazia", () => {
    expect(typeof VERSAO_LGPD).toBe("string");
    expect(VERSAO_LGPD.length).toBeGreaterThan(0);
  });

  it("deve exportar ARQUIVO_LGPD como string não vazia", () => {
    expect(typeof ARQUIVO_LGPD).toBe("string");
    expect(ARQUIVO_LGPD.length).toBeGreaterThan(0);
  });

  it("VERSAO_LGPD deve seguir o formato semântico X.Y.Z", () => {
    expect(VERSAO_LGPD).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("VERSAO_LGPD deve ser '1.0.0'", () => {
    expect(VERSAO_LGPD).toBe("1.0.0");
  });

  it("ARQUIVO_LGPD deve ser 'politica-privacidade.md'", () => {
    expect(ARQUIVO_LGPD).toBe("politica-privacidade.md");
  });
});
