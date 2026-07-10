import { describe, it, expect } from "vitest";
import { listarRacas, obterRaca } from "./racas.js";

describe("listarRacas", () => {
  it("retorna as 7 raças disponíveis", () => {
    const racas = listarRacas();
    expect(racas).toHaveLength(7);
    expect(racas.map((r) => r.nome)).toEqual([
      "Anão", "Elfo", "Humano", "Morto-vivo", "Orc", "Bestial", "Dragonoide",
    ]);
  });
});

describe("obterRaca", () => {
  it("retorna o bônus correto do Anão", () => {
    const raca = obterRaca("Anão");
    expect(raca.bonus).toEqual({ hp: 0, atk: -3, def: 15, critChance: 0 });
    expect(raca.restricoes).toEqual({});
  });

  it("retorna a restrição semArmadura do Dragonoide", () => {
    const raca = obterRaca("Dragonoide");
    expect(raca.bonus).toEqual({ hp: 15, atk: 5, def: 0, critChance: 0 });
    expect(raca.restricoes).toEqual({ semArmadura: true });
  });

  it("retorna o bônus de crítico do Bestial", () => {
    const raca = obterRaca("Bestial");
    expect(raca.bonus.critChance).toBe(10);
  });

  it("lança erro para uma raça que não existe", () => {
    expect(() => obterRaca("Anjo")).toThrow('Raça "Anjo" não existe.');
  });
});
