import { describe, it, expect } from "vitest";
import { criarInimigoTreino } from "./inimigoTreino.js";

describe("criarInimigoTreino", () => {
  it("retorna um Orc com o shape esperado pelo engine de combate", () => {
    const inimigo = criarInimigoTreino();
    expect(inimigo).toEqual({
      nome: "Orc",
      atk: 9,
      defesa: 3,
      hp: 40,
      hpMax: 40,
      xp: 18,
      ouro: 15,
      habilidade: "envenenamento",
      status: [],
    });
  });

  it("retorna uma nova instância a cada chamada (sem estado compartilhado)", () => {
    const a = criarInimigoTreino();
    const b = criarInimigoTreino();
    a.hp = 0;
    expect(b.hp).toBe(40);
  });
});
