import { describe, it, expect } from "vitest";
import { xpParaProximoNivel, checarLevelUp } from "./experiencia.js";

describe("xpParaProximoNivel", () => {
  it("calcula floor(50 * nivel^1.4) para o nível 1", () => {
    expect(xpParaProximoNivel({ nivel: 1 })).toBe(50);
  });

  it("calcula floor(50 * nivel^1.4) para o nível 3", () => {
    // 50 * 3^1.4 = 50 * 4.6555... = 232.77... -> floor = 232
    expect(xpParaProximoNivel({ nivel: 3 })).toBe(232);
  });
});

describe("checarLevelUp", () => {
  it("não sobe de nível quando o XP é insuficiente", () => {
    const jogador = { nivel: 1, xp: 10, hpMax: 100, hp: 80, ataque: 5, defesa: 5 };
    const eventos = checarLevelUp(jogador);
    expect(eventos).toEqual([]);
    expect(jogador.nivel).toBe(1);
    expect(jogador.xp).toBe(10);
  });

  it("sobe um nível, restaura o HP e aplica os ganhos de atributo", () => {
    const jogador = { nivel: 1, xp: 50, hpMax: 100, hp: 40, ataque: 5, defesa: 5 };
    const eventos = checarLevelUp(jogador);
    expect(eventos).toEqual([{ tipo: "level_up", nivel: 2, hpMax: 115 }]);
    expect(jogador.nivel).toBe(2);
    expect(jogador.xp).toBe(0);
    expect(jogador.hpMax).toBe(115);
    expect(jogador.hp).toBe(115);
    expect(jogador.ataque).toBe(7);
    expect(jogador.defesa).toBe(6);
  });

  it("sobe múltiplos níveis numa única chamada quando o XP acumulado é suficiente", () => {
    const jogador = { nivel: 1, xp: 300, hpMax: 100, hp: 100, ataque: 5, defesa: 5 };
    const eventos = checarLevelUp(jogador);
    // nível 1->2 custa floor(50*1^1.4)=50 (sobra 250), nível 2->3 custa floor(50*2^1.4)=131 (sobra 119)
    // -> nível 3, não alcança o custo do nível 3->4 (floor(50*3^1.4)=232)
    expect(eventos).toHaveLength(2);
    expect(jogador.nivel).toBe(3);
    expect(jogador.xp).toBe(119);
  });
});
