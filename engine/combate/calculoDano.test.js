import { describe, it, expect, vi, afterEach } from "vitest";
import {
  calcularAtaqueJogador,
  calcularDefesaJogador,
  calcularDanoBaseJogador,
  calcularChanceCriticaJogador,
  aplicarFuriaBarbaro,
  calcularDefesaInimigo,
  resolverAtaqueJogador,
  resolverAtaqueInimigo,
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

describe("resolverAtaqueJogador", () => {
  function jogadorBase() {
    return {
      ataque: 10,
      nivel: 0,
      equipamentos: {},
      bonusAtk: 0,
      amuletoEquipado: false,
      armaEquipada: null,
      bonusClasse: {},
      bonusRaca: {},
      bonusCritico: 0,
      classe: "Guerreiro",
      hp: 100,
      hpMax: 100,
    };
  }

  function inimigoBase() {
    return { defesa: 3, bonusDef: 0, habilidade: null };
  }

  it("causa dano normal sem crítico quando a chance de crítico é zero e o inimigo não esquiva", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(0,4)=0 dentro de calcularDanoBaseJogador
    const resultado = resolverAtaqueJogador(jogadorBase(), inimigoBase());
    // danoBruto=10, defesa=3, dano=7, sem fúria, chanceCritica=0 (sem 2ª chamada), habilidade null (sem 3ª chamada)
    expect(resultado).toEqual({ dano: 7, critico: false, esquivou: false });
  });

  it("dobra o dano quando o crítico é acertado", () => {
    const jogador = { ...jogadorBase(), bonusCritico: 50 };
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // rand(0,4) em calcularDanoBaseJogador -> 0
      .mockReturnValueOnce(0); // rand(1,100) do crítico -> 1, <=50 sucesso
    const resultado = resolverAtaqueJogador(jogador, inimigoBase());
    expect(resultado).toEqual({ dano: 14, critico: true, esquivou: false });
  });

  it("o inimigo com habilidade esquiva pode evitar o dano", () => {
    const inimigo = { ...inimigoBase(), habilidade: "esquiva" };
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // rand(0,4) -> 0
      .mockReturnValueOnce(0); // rand(1,100) da esquiva -> 1, <=15 sucesso
    const resultado = resolverAtaqueJogador(jogadorBase(), inimigo);
    expect(resultado).toEqual({ dano: 0, critico: false, esquivou: true });
  });
});

describe("resolverAtaqueInimigo", () => {
  function inimigoBase() {
    return { atk: 10, status: [] };
  }

  function jogadorBase() {
    return {
      defesa: 5,
      equipamentos: {},
      bonusDef: 0,
      bonusClasse: {},
      bonusEsquiva: 0,
      bonusBloqueio: 0,
    };
  }

  it("causa dano normal quando o jogador não esquiva nem bloqueia", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // aplica-se às 3 chamadas de rand desta função
    // danoBase = max(1, 10 + rand(0,3)=0 - floor(defesaJogador(5)/5)=1) = 9
    const resultado = resolverAtaqueInimigo(inimigoBase(), jogadorBase());
    expect(resultado).toEqual({ resultado: "dano", dano: 9 });
  });

  it("o jogador esquiva quando a chance é suficiente", () => {
    const jogador = { ...jogadorBase(), bonusEsquiva: 50 };
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // rand(0,3) da base -> 0
      .mockReturnValueOnce(0); // rand(1,100) da esquiva -> 1, <=50 sucesso
    const resultado = resolverAtaqueInimigo(inimigoBase(), jogador);
    expect(resultado).toEqual({ resultado: "esquiva", dano: 0 });
  });

  it("o jogador bloqueia quando a esquiva falha mas o bloqueio é suficiente", () => {
    const jogador = { ...jogadorBase(), bonusBloqueio: 50 };
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // rand(0,3) da base -> 0
      .mockReturnValueOnce(0) // rand(1,100) da esquiva (total=0) -> 1, falha
      .mockReturnValueOnce(0); // rand(1,100) do bloqueio -> 1, <=50 sucesso
    const resultado = resolverAtaqueInimigo(inimigoBase(), jogador);
    expect(resultado).toEqual({ resultado: "bloqueio", dano: 0 });
  });
});
