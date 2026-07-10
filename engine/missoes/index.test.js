import { describe, it, expect, vi, afterEach } from "vitest";
import { filtroMissao, aplicarPenalidade, resolverResultadoMissao } from "./index.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("filtroMissao", () => {
  it("retorna null quando o jogador não atende o nível mínimo de nenhuma missão", () => {
    expect(filtroMissao({ nivel: 0 })).toBeNull();
  });

  it("retorna uma missão cujo nivelMinimo o jogador atende", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const missao = filtroMissao({ nivel: 1 });
    expect(missao).not.toBeNull();
    expect(missao.nivelMinimo).toBeLessThanOrEqual(1);
  });
});

describe("aplicarPenalidade", () => {
  it("tipo ouro: perde entre 15 e 100 de ouro (rand fixo, ignora percentualMin/Max da missão)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(15,100)=15
    const jogador = { ouro: 50 };
    const resultado = aplicarPenalidade("ouro", jogador);
    expect(resultado).toEqual({ tipo: "ouro", valor: 15, mensagem: "Você perdeu 15 de ouro." });
    expect(jogador.ouro).toBe(35);
  });

  it("tipo ouro: nunca deixa o ouro negativo", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99); // rand(15,100)=100
    const jogador = { ouro: 50 };
    aplicarPenalidade("ouro", jogador);
    expect(jogador.ouro).toBe(0);
  });

  it("tipo hp: perde 20% do HP atual, nunca abaixo de 1", () => {
    const jogador = { hp: 50 };
    const resultado = aplicarPenalidade("hp", jogador);
    expect(resultado).toEqual({ tipo: "hp", valor: 10, mensagem: "Você perdeu 10 de HP." });
    expect(jogador.hp).toBe(40);
  });

  it("tipo item: nunca aplica (jogador.setCompleto nunca é populado nesta versão)", () => {
    const jogador = { setCompleto: false };
    const resultado = aplicarPenalidade("item", jogador);
    expect(resultado).toEqual({ tipo: "nenhuma", valor: 0, mensagem: "Sem penalidades graves desta vez." });
  });

  it("tipo desconhecido: sem penalidade", () => {
    const jogador = {};
    expect(aplicarPenalidade("nenhum", jogador)).toEqual({ tipo: "nenhuma", valor: 0, mensagem: "Sem penalidades graves desta vez." });
  });
});

describe("resolverResultadoMissao", () => {
  function jogadorBase() {
    return { nivel: 1, xp: 0, ouro: 0, classe: "Guerreiro", inventario: [], itens: [] };
  }

  function missaoDeTeste() {
    return {
      xp: (nivel) => 15 + nivel,
      ouro: (nivel) => 10 + nivel,
      item: { nome: "Pena do Corvo Sombrio", raridade: "comum" },
      chanceMissaoExtra: 10,
      falha: { tipo: "hp", percentual: 10 },
    };
  }

  it("sucesso: concede xp/ouro e chama level up", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0)    // resultado = rand(1,100) = 1 -> sucesso (chanceSucesso testada via missao.chanceSucesso separadamente)
      .mockReturnValue(0.99);    // demais rolagens (item, poção, missão extra) falham
    const jogador = jogadorBase();
    const missao = { ...missaoDeTeste(), chanceSucesso: 100 };
    const resultado = resolverResultadoMissao(jogador, missao);

    expect(resultado.sucesso).toBe(true);
    expect(resultado.xpGanho).toBe(16);
    expect(resultado.ouroGanho).toBe(11);
    expect(jogador.xp).toBe(16);
    expect(jogador.ouro).toBe(11);
  });

  it("sucesso com drop de item: chance base 80% para item comum, aplica bônus de 10% para Assassino", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0)    // resultado sucesso
      .mockReturnValueOnce(0)    // roll do item: rand(1,100)=1, <=90 (80+10 Assassino) sucesso
      .mockReturnValue(0.99);    // poção e missão extra falham
    const jogador = { ...jogadorBase(), classe: "Assassino" };
    const missao = { ...missaoDeTeste(), chanceSucesso: 100 };
    const resultado = resolverResultadoMissao(jogador, missao);

    expect(resultado.itemGanho).toBe("Pena do Corvo Sombrio");
    expect(jogador.inventario).toEqual(["Pena do Corvo Sombrio"]);
  });

  it("falha: aplica a penalidade da missão", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99); // resultado = 100 > chanceSucesso
    const jogador = { ...jogadorBase(), hp: 100 };
    const missao = { ...missaoDeTeste(), chanceSucesso: 50 };
    const resultado = resolverResultadoMissao(jogador, missao);

    expect(resultado.sucesso).toBe(false);
    expect(resultado.penalidade).toEqual({ tipo: "hp", valor: 20, mensagem: "Você perdeu 20 de HP." });
    expect(jogador.hp).toBe(80);
  });
});
