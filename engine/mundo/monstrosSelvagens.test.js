import { describe, it, expect } from "vitest";
import { listarEspeciesSelvagens, obterEspecieSelvagem, criarInimigoSelvagem } from "./monstrosSelvagens.js";

describe("monstrosSelvagens", () => {
  it("lista todas as espécies selvagens", () => {
    expect(listarEspeciesSelvagens().length).toBeGreaterThan(0);
  });

  it("obtém uma espécie pelo id", () => {
    expect(obterEspecieSelvagem("goblin").nome).toBe("Goblin Selvagem");
  });

  it("lança erro para espécie inexistente", () => {
    expect(() => obterEspecieSelvagem("dragao-inexistente")).toThrow();
  });

  it("cria um inimigo com hp/hpMax iguais e escalado por nível", () => {
    const inimigo = criarInimigoSelvagem("goblin", 1);
    expect(inimigo.nome).toBe("Goblin Selvagem");
    expect(inimigo.hp).toBe(inimigo.hpMax);
    expect(inimigo.hp).toBeGreaterThanOrEqual(18);
    expect(inimigo.status).toEqual([]);
  });

  it("aumenta os atributos em níveis mais altos", () => {
    const baixo = criarInimigoSelvagem("orc", 1);
    const alto = criarInimigoSelvagem("orc", 20);
    expect(alto.hpMax).toBeGreaterThan(baixo.hpMax);
  });
});
