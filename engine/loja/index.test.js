import { describe, it, expect } from "vitest";
import { comprarItem, itensVendiveis, venderItens } from "./index.js";

describe("comprarItem", () => {
  it("compra quando há ouro suficiente, debita o preço e adiciona ao inventário", () => {
    const jogador = { ouro: 3000, inventario: [] };
    const item = { nome: "Elmo de Ferro", preco: 2050 };
    expect(comprarItem(jogador, item)).toBe(true);
    expect(jogador.ouro).toBe(950);
    expect(jogador.inventario).toEqual([item]);
  });

  it("não compra quando o ouro é insuficiente", () => {
    const jogador = { ouro: 100, inventario: [] };
    const item = { nome: "Elmo de Ferro", preco: 2050 };
    expect(comprarItem(jogador, item)).toBe(false);
    expect(jogador.ouro).toBe(100);
    expect(jogador.inventario).toEqual([]);
  });
});

describe("itensVendiveis", () => {
  it("filtra fora os consumíveis, mantém armas e armaduras", () => {
    const inventario = [
      { nome: "Poção de Cura", slot: "consumable" },
      { nome: "Espada Longa", slot: "weapon" },
      { nome: "Elmo de Ferro", slot: "head" },
    ];
    expect(itensVendiveis(inventario).map((i) => i.nome)).toEqual(["Espada Longa", "Elmo de Ferro"]);
  });
});

describe("venderItens", () => {
  it("vende os itens selecionados por 30% do preço, soma o total e remove do inventário", () => {
    const jogador = {
      ouro: 0,
      inventario: [
        { nome: "Espada Longa", slot: "weapon", preco: 2500 },
        { nome: "Elmo de Ferro", slot: "head", preco: 2050 },
        { nome: "Poção de Cura", slot: "consumable", preco: 200 },
      ],
    };
    const resultado = venderItens(jogador, [0, 1]); // vende Espada Longa e Elmo de Ferro
    // floor(2500*0.3)=750, floor(2050*0.3)=615, total=1365
    expect(resultado).toEqual({ totalRecebido: 1365 });
    expect(jogador.ouro).toBe(1365);
    expect(jogador.inventario).toEqual([{ nome: "Poção de Cura", slot: "consumable", preco: 200 }]);
  });
});
