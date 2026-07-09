import { describe, it, expect, vi, afterEach } from "vitest";
import {
  calcularAtaqueJogador,
  calcularDefesaJogador,
  calcularDanoBaseJogador,
  calcularChanceCriticaJogador,
  aplicarFuriaBarbaro,
  calcularDefesaInimigo,
} from "./calculoDano.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("calcularAtaqueJogador", () => {
  it("soma ataque base, bônus de nível, equipamentos, bônus extra e arma equipada", () => {
    const jogador = {
      ataque: 10,
      nivel: 3,
      equipamentos: { arma: { atkBonus: 5 }, armadura: null },
      bonusAtk: 2,
      amuletoEquipado: false,
      ataqueOriginal: 10,
      armaEquipada: { atk: 3 },
    };
    // 10 + floor(3*2)=6 + 5 (equip) + 2 (bonusAtk) + 3 (arma) = 26
    expect(calcularAtaqueJogador(jogador)).toBe(26);
  });

  it("soma o bônus do amuleto (2% do ataque original) quando equipado", () => {
    const jogador = {
      ataque: 10,
      nivel: 0,
      equipamentos: {},
      bonusAtk: 0,
      amuletoEquipado: true,
      ataqueOriginal: 100,
      armaEquipada: null,
    };
    // 10 + 0 + 0 + 0 + floor(100*0.02)=2 = 12
    expect(calcularAtaqueJogador(jogador)).toBe(12);
  });
});

describe("calcularDefesaJogador", () => {
  it("soma defesa base, defesa dos equipamentos e bônus extra", () => {
    const jogador = {
      defesa: 8,
      equipamentos: { armadura: { defesa: 4 }, capacete: { defesa: 2 } },
      bonusDef: 1,
    };
    expect(calcularDefesaJogador(jogador)).toBe(15);
  });
});

describe("calcularDanoBaseJogador", () => {
  it("soma o ataque total a uma variação aleatória de 0 a 4", () => {
    const jogador = {
      ataque: 10,
      nivel: 0,
      equipamentos: {},
      bonusAtk: 0,
      amuletoEquipado: false,
      armaEquipada: null,
    };
    vi.spyOn(Math, "random").mockReturnValue(0.9); // rand(0,4) = 4
    expect(calcularDanoBaseJogador(jogador)).toBe(14);
  });
});

describe("calcularChanceCriticaJogador", () => {
  it("soma bônus de classe, raça, crítico direto e efeito de arma", () => {
    const jogador = {
      bonusClasse: { critChance: 5 },
      bonusRaca: { critChance: 3 },
      bonusCritico: 2,
      armaEquipada: { efeito: { tipo: "critico", chance: 10 } },
    };
    expect(calcularChanceCriticaJogador(jogador)).toBe(20);
  });
});

describe("aplicarFuriaBarbaro", () => {
  it("aumenta o dano em 50% quando o Bárbaro está com 35% de HP ou menos", () => {
    const jogador = { classe: "Bárbaro", hp: 30, hpMax: 100 };
    expect(aplicarFuriaBarbaro(jogador, 10)).toBe(15);
  });

  it("não altera o dano para outras classes", () => {
    const jogador = { classe: "Guerreiro", hp: 30, hpMax: 100 };
    expect(aplicarFuriaBarbaro(jogador, 10)).toBe(10);
  });
});

describe("calcularDefesaInimigo", () => {
  it("soma defesa base e bônus de defesa", () => {
    const inimigo = { defesa: 6, bonusDef: 2 };
    expect(calcularDefesaInimigo(inimigo)).toBe(8);
  });
});
