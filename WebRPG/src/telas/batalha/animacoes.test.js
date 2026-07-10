import { describe, it, expect, vi } from "vitest";
import { reproduzirEventos } from "./animacoes.js";

vi.mock("./sprites.js", () => ({
  tocarAnimacao: vi.fn(() => Promise.resolve()),
}));

vi.mock("@audio/tocador.js", () => ({
  tocarEfeito: vi.fn(),
}));

function criarElementosDeTeste() {
  return {
    palco: document.createElement("div"),
    spriteJogador: document.createElement("div"),
    spriteInimigo: document.createElement("div"),
    combatenteJogador: document.createElement("div"),
    combatenteInimigo: document.createElement("div"),
  };
}

describe("reproduzirEventos", () => {
  it("mostra um número de dano no combatente alvo para eventos de dano", async () => {
    const elementos = criarElementosDeTeste();
    const eventos = [
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 7, critico: false },
    ];

    await reproduzirEventos(eventos, elementos);

    expect(elementos.combatenteInimigo.querySelector(".numero-dano").textContent).toBe(
      "7"
    );
  });

  it("marca o número de dano como crítico quando o evento é crítico", async () => {
    const elementos = criarElementosDeTeste();
    const eventos = [
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 14, critico: true },
    ];

    await reproduzirEventos(eventos, elementos);

    const numero = elementos.combatenteInimigo.querySelector(".numero-dano");
    expect(numero.classList.contains("numero-dano--critico")).toBe(true);
    expect(numero.textContent).toBe("14!");
  });

  it("processa múltiplos eventos em sequência sem lançar erro", async () => {
    const elementos = criarElementosDeTeste();
    const eventos = [
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 7, critico: false },
      { tipo: "sangramento_tick", alvo: "inimigo", dano: 4, curado: false },
      { tipo: "dano", autor: "inimigo", alvo: "jogador", valor: 5, critico: false },
    ];

    await expect(reproduzirEventos(eventos, elementos)).resolves.toBeUndefined();
  });
});

describe("reproduzirEventos toca efeitos sonoros", () => {
  it("toca 'golpe' para dano normal e 'critico' para dano crítico", async () => {
    const { tocarEfeito } = await import("@audio/tocador.js");
    const elementos = criarElementosDeTeste();

    await reproduzirEventos([
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 7, critico: false },
    ], elementos);
    expect(tocarEfeito).toHaveBeenCalledWith("golpe");

    tocarEfeito.mockClear();
    await reproduzirEventos([
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 14, critico: true },
    ], elementos);
    expect(tocarEfeito).toHaveBeenCalledWith("critico");
  });

  it("toca 'moeda' ao vencer a batalha", async () => {
    const { tocarEfeito } = await import("@audio/tocador.js");
    const elementos = criarElementosDeTeste();
    await reproduzirEventos([{ tipo: "vitoria", xpGanho: 10, ouroGanho: 5 }], elementos);
    expect(tocarEfeito).toHaveBeenCalledWith("moeda");
  });
});
