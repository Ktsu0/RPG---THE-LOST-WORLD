import { describe, it, expect } from "vitest";
import { spriteParaInimigo } from "./mapaSprites.js";

describe("spriteParaInimigo", () => {
  it('mapeia "Orc" para o sprite "orc"', () => {
    expect(spriteParaInimigo("Orc")).toBe("orc");
  });

  it("retorna o sprite padrão (orc) para um nome sem mapeamento conhecido", () => {
    expect(spriteParaInimigo("Monstro Nunca Visto")).toBe("orc");
  });

  it.each([
    ["Esqueleto Errante", "esqueleto"],
    ["Cavaleiro Caído", "esqueleto"],
    ["Lich Menor", "esqueleto"],
    ["Senhor dos Mortos", "esqueleto"],
    ["Cavaleiro Sombrio", "esqueleto"],
    ["Lorde do Caos", "esqueleto"],
    ["Zumbi Apodrecido", "goblin"],
    ["Imp Menor", "goblin"],
    ["Comandante Ígneo", "goblin"],
    ["Golem de Cristal", "cogumelo"],
    ["Golem Titânico", "cogumelo"],
    ["Guardião de Cristal", "cogumelo"],
    ["Elemental de Cristal", "cogumelo"],
    ["Aranha da Cripta", "olho-voador"],
    ["Aranha Venenosa", "olho-voador"],
    ["Morcego Gigante", "olho-voador"],
  ])('mapeia "%s" para o sprite "%s"', (nome, pasta) => {
    expect(spriteParaInimigo(nome)).toBe(pasta);
  });

  it.each([
    "Guardião de Pedra", "Sentinela de Ferro", "Mago Sombrio", "Lobo Alfa",
    "Hidra das Sombras", "Dragão Negro", "Salamandra de Fogo", "Escorpião de Magma",
    "Senhor das Chamas",
  ])('cai no sprite padrão (orc) para "%s" (arquétipo não baixado)', (nome) => {
    expect(spriteParaInimigo(nome)).toBe("orc");
  });
});
