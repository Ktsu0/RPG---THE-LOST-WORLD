import { describe, it, expect } from "vitest";
import { aplicarBonusDeConjunto, equiparArmaduraNoSlot, equiparArma, compararAtributos } from "./equipar.js";

function jogadorBase() {
  return {
    equipamentos: { head: null, chest: null, hands: null, legs: null, feet: null },
    armaEquipada: null,
    inventario: [],
    bonusEsquiva: 0, bonusCritico: 0, bonusBloqueio: 0, bonusHP: 0, bonusAtk: 0,
  };
}

describe("aplicarBonusDeConjunto", () => {
  it("zera os bônus quando nenhum conjunto está completo", () => {
    const jogador = { ...jogadorBase(), bonusEsquiva: 99 };
    aplicarBonusDeConjunto(jogador);
    expect(jogador).toMatchObject({ bonusEsquiva: 0, bonusCritico: 0, bonusBloqueio: 0, bonusHP: 0, bonusAtk: 0 });
  });

  it("aplica +15% de bloqueio quando as 5 peças do conjunto Ferro estão equipadas", () => {
    const jogador = jogadorBase();
    for (const slot of ["head", "chest", "hands", "legs", "feet"]) {
      jogador.equipamentos[slot] = { nome: `Peça Ferro ${slot}`, slot, set: "Ferro", defesa: 1, atkBonus: 0 };
    }
    aplicarBonusDeConjunto(jogador);
    expect(jogador.bonusBloqueio).toBe(15);
  });

  it("aplica +10% esquiva e +10% crítico quando o conjunto Sombra está completo", () => {
    const jogador = jogadorBase();
    for (const slot of ["head", "chest", "hands", "legs", "feet"]) {
      jogador.equipamentos[slot] = { nome: `Peça Sombra ${slot}`, slot, set: "Sombra", defesa: 1, atkBonus: 0 };
    }
    aplicarBonusDeConjunto(jogador);
    expect(jogador.bonusEsquiva).toBe(10);
    expect(jogador.bonusCritico).toBe(10);
  });

  it("não aplica bônus se o conjunto estiver incompleto (só 4 de 5 peças)", () => {
    const jogador = jogadorBase();
    for (const slot of ["head", "chest", "hands", "legs"]) {
      jogador.equipamentos[slot] = { nome: `Peça Dragão ${slot}`, slot, set: "Dragão", defesa: 1, atkBonus: 0 };
    }
    aplicarBonusDeConjunto(jogador);
    expect(jogador.bonusHP).toBe(0);
    expect(jogador.bonusAtk).toBe(0);
  });
});

describe("equiparArmaduraNoSlot", () => {
  it("equipa numa peça vazia e devolve itemAntigo null", () => {
    const jogador = jogadorBase();
    const elmo = { nome: "Elmo de Ferro", slot: "head", set: "Ferro", defesa: 6, atkBonus: 0 };
    const resultado = equiparArmaduraNoSlot(jogador, elmo);
    expect(resultado).toEqual({ itemAntigo: null });
    expect(jogador.equipamentos.head).toBe(elmo);
  });

  it("troca uma peça já equipada, devolvendo a antiga", () => {
    const jogador = jogadorBase();
    const elmoVelho = { nome: "Elmo Velho", slot: "head", set: null, defesa: 2, atkBonus: 0 };
    jogador.equipamentos.head = elmoVelho;
    const elmoNovo = { nome: "Elmo Novo", slot: "head", set: null, defesa: 6, atkBonus: 0 };

    const resultado = equiparArmaduraNoSlot(jogador, elmoNovo);

    expect(resultado).toEqual({ itemAntigo: elmoVelho });
    expect(jogador.equipamentos.head).toBe(elmoNovo);
  });
});

describe("equiparArma", () => {
  it("equipa quando não há arma e devolve itemAntigo null", () => {
    const jogador = jogadorBase();
    const espada = { nome: "Espada Longa", slot: "weapon", atk: 5, efeito: null };
    const resultado = equiparArma(jogador, espada);
    expect(resultado).toEqual({ itemAntigo: null });
    expect(jogador.armaEquipada).toBe(espada);
  });

  it("troca a arma equipada, devolvendo a antiga", () => {
    const jogador = jogadorBase();
    const antiga = { nome: "Adaga", slot: "weapon", atk: 3, efeito: null };
    jogador.armaEquipada = antiga;
    const nova = { nome: "Foice do Ceifador", slot: "weapon", atk: 12, efeito: { tipo: "roubo_de_vida", percentual: 0.15 } };

    const resultado = equiparArma(jogador, nova);

    expect(resultado).toEqual({ itemAntigo: antiga });
    expect(jogador.armaEquipada).toBe(nova);
  });
});

describe("compararAtributos", () => {
  it("retorna 0/0 quando não há item atual (slot vazio)", () => {
    const novo = { defesa: 6, atkBonus: 2 };
    expect(compararAtributos(null, novo)).toEqual({ defesa: 6, atkBonus: 2 });
  });

  it("retorna a diferença positiva (upgrade)", () => {
    const atual = { defesa: 4, atkBonus: 1 };
    const novo = { defesa: 6, atkBonus: 2 };
    expect(compararAtributos(atual, novo)).toEqual({ defesa: 2, atkBonus: 1 });
  });

  it("retorna a diferença negativa (downgrade)", () => {
    const atual = { defesa: 12, atkBonus: 5 };
    const novo = { defesa: 6, atkBonus: 2 };
    expect(compararAtributos(atual, novo)).toEqual({ defesa: -6, atkBonus: -3 });
  });
});
