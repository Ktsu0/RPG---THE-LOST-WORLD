import { describe, it, expect } from "vitest";
import { spriteParaInimigo } from "./mapaSprites.js";

describe("spriteParaInimigo", () => {
  it('mapeia "Orc" para o sprite "orc"', () => {
    expect(spriteParaInimigo("Orc")).toBe("orc");
  });

  it("retorna o sprite padrão (orc) para um nome sem mapeamento conhecido", () => {
    expect(spriteParaInimigo("Monstro Nunca Visto")).toBe("orc");
  });
});
