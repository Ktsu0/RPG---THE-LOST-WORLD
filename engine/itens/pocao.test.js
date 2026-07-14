import { describe, it, expect, vi, afterEach } from "vitest";
import { contarPocoes, consumirPocao, usarPocaoDeCura } from "./pocao.js";

afterEach(() => vi.restoreAllMocks());

describe("contarPocoes", () => {
  it("soma as duas contabilidades: objetos no inventario e strings em itens", () => {
    const jogador = {
      inventario: [{ nome: "Poção de Cura", slot: "consumable" }, { nome: "Espada Longa", slot: "weapon" }],
      itens: ["Poção de Cura", "Pena do Corvo Sombrio"],
    };
    expect(contarPocoes(jogador)).toBe(2);
  });

  it("retorna 0 quando não há nenhuma poção", () => {
    expect(contarPocoes({ inventario: [], itens: [] })).toBe(0);
  });
});

describe("consumirPocao", () => {
  it("remove primeiro da lista itens (strings), preservando o resto", () => {
    const jogador = {
      inventario: [{ nome: "Poção de Cura", slot: "consumable" }],
      itens: ["Poção de Cura", "Pena do Corvo Sombrio"],
    };
    expect(consumirPocao(jogador)).toBe(true);
    expect(jogador.itens).toEqual(["Pena do Corvo Sombrio"]);
    expect(jogador.inventario).toHaveLength(1);
  });

  it("remove do inventario quando itens não tem poção", () => {
    const jogador = {
      inventario: [{ nome: "Poção de Cura", slot: "consumable" }],
      itens: [],
    };
    expect(consumirPocao(jogador)).toBe(true);
    expect(jogador.inventario).toEqual([]);
  });

  it("retorna false sem mutar nada quando não há poção", () => {
    const jogador = { inventario: [], itens: [] };
    expect(consumirPocao(jogador)).toBe(false);
  });
});

describe("usarPocaoDeCura", () => {
  it("cura entre 20% e 30% do hpMax (fiel ao console), capado no hpMax", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(min,max) = min
    const jogador = { hp: 50, hpMax: 100, inventario: [], itens: ["Poção de Cura"] };
    expect(usarPocaoDeCura(jogador)).toEqual({ usou: true, cura: 20 }); // floor(100*0.20)
    expect(jogador.hp).toBe(70);
    expect(jogador.itens).toEqual([]);
  });

  it("não deixa o hp passar do hpMax", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999); // rand(min,max) = max
    const jogador = { hp: 95, hpMax: 100, inventario: [], itens: ["Poção de Cura"] };
    const resultado = usarPocaoDeCura(jogador);
    expect(resultado.usou).toBe(true);
    expect(jogador.hp).toBe(100);
  });

  it("retorna {usou: false, cura: 0} sem poções", () => {
    const jogador = { hp: 50, hpMax: 100, inventario: [], itens: [] };
    expect(usarPocaoDeCura(jogador)).toEqual({ usou: false, cura: 0 });
    expect(jogador.hp).toBe(50);
  });
});
