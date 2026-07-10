import { describe, it, expect } from "vitest";
import { missoesDisponiveis } from "./catalogo.js";

describe("missoesDisponiveis", () => {
  it("tem 14 missões (15 do console menos a Arena Infinita, fora de escopo da Fase 3)", () => {
    expect(missoesDisponiveis).toHaveLength(14);
    expect(missoesDisponiveis.find((m) => m.tipoBatalha === "arena_infinita")).toBeUndefined();
  });

  it("a missão de ondas 'Desafio da Arena Amaldiçoada' está presente com os campos corretos", () => {
    const missao = missoesDisponiveis.find((m) => m.descricao === "Desafio da Arena Amaldiçoada");
    expect(missao.tipoBatalha).toBe("ondas");
    expect(missao.nivelMinimo).toBe(4);
    expect(missao.xp(10)).toBe(100); // 50 + 10*5
    expect(missao.ouro(10)).toBe(200); // 100 + 10*10
    expect(missao.falha).toEqual({ tipo: "hp", percentual: 50 });
  });

  it("a missão 'Escoltar um mercador até a cidade' tem as recompensas corretas", () => {
    const missao = missoesDisponiveis.find((m) => m.descricao === "Escoltar um mercador até a cidade");
    expect(missao.chanceSucesso).toBe(85);
    expect(missao.xp(5)).toBe(20); // 15 + 5*1
    expect(missao.ouro(5)).toBe(15); // 10 + 5*1
  });

  it("todas as missões narrativas (sem tipoBatalha) têm história pré-escrita não vazia", () => {
    const narrativas = missoesDisponiveis.filter((m) => !m.tipoBatalha);
    expect(narrativas.length).toBeGreaterThan(0);
    for (const missao of narrativas) {
      expect(typeof missao.historia).toBe("string");
      expect(missao.historia.length).toBeGreaterThan(0);
    }
  });
});
