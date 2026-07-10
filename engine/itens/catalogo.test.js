import { describe, it, expect } from "vitest";
import { conjuntosArmadura, catalogoArmas, catalogoConsumiveis, catalogoLoja } from "./catalogo.js";

describe("conjuntosArmadura", () => {
  it("tem os 4 conjuntos, cada um com 5 peças (uma por slot)", () => {
    expect(Object.keys(conjuntosArmadura)).toEqual(["Ferro", "Ligeiro", "Sombra", "Dragão"]);
    for (const pecas of Object.values(conjuntosArmadura)) {
      expect(pecas).toHaveLength(5);
      expect(pecas.map((p) => p.slot).sort()).toEqual(["chest", "feet", "hands", "head", "legs"]);
    }
  });

  it("o Peitoral do Dragão tem os atributos corretos", () => {
    const peitoral = conjuntosArmadura["Dragão"].find((p) => p.nome === "Peitoral do Dragão");
    expect(peitoral).toEqual({ nome: "Peitoral do Dragão", slot: "chest", defesa: 20, atkBonus: 7, preco: 17510, raridade: "lendario" });
  });
});

describe("catalogoArmas", () => {
  it("tem as 10 armas do console, com efeitos corretos", () => {
    expect(catalogoArmas).toHaveLength(10);
    const adaga = catalogoArmas.find((a) => a.nome === "Adaga Sombria");
    expect(adaga).toEqual({
      nome: "Adaga Sombria", slot: "weapon", atk: 6, preco: 6500,
      efeito: { tipo: "sangramento", chance: 20, danoPorTurno: 5, duracao: 3 },
      raridade: "raro",
    });
    const foice = catalogoArmas.find((a) => a.nome === "Foice do Ceifador");
    expect(foice.efeito).toEqual({ tipo: "roubo_de_vida", percentual: 0.15 });
  });
});

describe("catalogoConsumiveis", () => {
  it("tem a Poção de Cura", () => {
    expect(catalogoConsumiveis).toEqual([{ nome: "Poção de Cura", slot: "consumable", preco: 200, raridade: "comum" }]);
  });
});

describe("catalogoLoja", () => {
  it("combina armaduras, consumíveis e armas com ids únicos", () => {
    expect(catalogoLoja).toHaveLength(20 + 1 + 10); // 4 conjuntos x 5 peças + 1 poção + 10 armas
    const ids = catalogoLoja.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("preserva o campo set nas peças de armadura", () => {
    const elmoFerro = catalogoLoja.find((i) => i.nome === "Elmo de Ferro");
    expect(elmoFerro.set).toBe("Ferro");
    expect(elmoFerro.defesa).toBe(6);
  });
});
