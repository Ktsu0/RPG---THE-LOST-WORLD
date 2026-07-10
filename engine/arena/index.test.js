import { describe, it, expect } from "vitest";
import {
  NIVEL_MINIMO_ARENA, podeAcessarArena,
  calcularDificuldadeOnda, calcularQuantidadeInimigos, isOndaMiniBoss,
  calcularPontos, calcularChanceFragmento,
  criarEstadoArena, confirmarCheckpoint,
  aplicarBencaoVitalidade, aplicarBencaoPoder, removerBonusArena,
} from "./index.js";

describe("podeAcessarArena", () => {
  it("exige nível 5", () => {
    expect(podeAcessarArena({ nivel: 4 })).toBe(false);
    expect(podeAcessarArena({ nivel: 5 })).toBe(true);
  });
});

describe("calcularDificuldadeOnda", () => {
  it("cresce com o número da onda, capado em 10", () => {
    expect(calcularDificuldadeOnda(3)).toBe(2); // floor(1+3/3)=2
    expect(calcularDificuldadeOnda(100)).toBe(10);
  });
});

describe("calcularQuantidadeInimigos", () => {
  it("1 inimigo até a onda 3, 2 até a 7, 3 até a 12, depois escala", () => {
    expect(calcularQuantidadeInimigos(2)).toBe(1);
    expect(calcularQuantidadeInimigos(5)).toBe(2);
    expect(calcularQuantidadeInimigos(10)).toBe(3);
    expect(calcularQuantidadeInimigos(20)).toBe(5);
  });
});

describe("isOndaMiniBoss", () => {
  it("true a cada 5 ondas", () => {
    expect(isOndaMiniBoss(5)).toBe(true);
    expect(isOndaMiniBoss(10)).toBe(true);
    expect(isOndaMiniBoss(6)).toBe(false);
  });
});

describe("calcularPontos", () => {
  it("onda normal: base 10", () => {
    expect(calcularPontos(5, false)).toBe(Math.round(10 * (1 + 5 * 0.1)));
  });

  it("onda de mini-boss: base 50", () => {
    expect(calcularPontos(5, true)).toBe(Math.round(50 * (1 + 5 * 0.1)));
  });
});

describe("calcularChanceFragmento", () => {
  it("mini-boss: min(70, 20+onda*1.5)", () => {
    expect(calcularChanceFragmento(10, true)).toBe(35);
    expect(calcularChanceFragmento(100, true)).toBe(70);
  });

  it("normal: min(25, 5+onda*0.3)", () => {
    expect(calcularChanceFragmento(10, false)).toBe(8);
    expect(calcularChanceFragmento(100, false)).toBe(25);
  });
});

describe("confirmarCheckpoint", () => {
  it("move fragmentos não confirmados para confirmados e zera os não confirmados", () => {
    const estado = { ...criarEstadoArena(), fragmentosNaoConfirmados: 3, fragmentosConfirmados: 2 };
    const resultado = confirmarCheckpoint(estado);
    expect(resultado.fragmentosConfirmados).toBe(5);
    expect(resultado.fragmentosNaoConfirmados).toBe(0);
  });
});

describe("bênçãos e remoção de bônus", () => {
  it("aplicarBencaoVitalidade soma 15% ao hpMax e registra no estado", () => {
    const jogador = { hpMax: 100 };
    const estado = criarEstadoArena();
    aplicarBencaoVitalidade(jogador, estado);
    expect(jogador.hpMax).toBe(115);
    expect(estado.bonusTemporarios.hpBonus).toBe(15);
  });

  it("aplicarBencaoPoder soma 10% ao ataque e registra no estado", () => {
    const jogador = { ataque: 20 };
    const estado = criarEstadoArena();
    aplicarBencaoPoder(jogador, estado);
    expect(jogador.ataque).toBe(22);
    expect(estado.bonusTemporarios.atkBonus).toBe(2);
  });

  it("removerBonusArena reverte os bônus temporários", () => {
    const jogador = { hpMax: 100, ataque: 20 };
    const estado = criarEstadoArena();
    aplicarBencaoVitalidade(jogador, estado);
    aplicarBencaoPoder(jogador, estado);
    removerBonusArena(jogador, estado);
    expect(jogador.hpMax).toBe(100);
    expect(jogador.ataque).toBe(20);
  });
});
