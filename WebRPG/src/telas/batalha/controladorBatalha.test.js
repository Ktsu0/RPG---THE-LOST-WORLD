import { describe, it, expect, vi } from "vitest";
import { iniciarBatalha } from "./controladorBatalha.js";

vi.mock("@engine/combate/index.js", () => ({
  criarEstadoBatalha: (jogador, inimigo) => ({ jogador, inimigo, rodada: 0 }),
  executarAcaoJogador: (estado) => ({
    estado: {
      ...estado,
      jogador: { ...estado.jogador, hp: 93 },
      inimigo: { ...estado.inimigo, hp: 23 },
    },
    eventos: [
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 7, critico: false },
      { tipo: "dano", autor: "inimigo", alvo: "jogador", valor: 7, critico: false },
    ],
    fim: null,
  }),
}));

vi.mock("./animacoes.js", () => ({
  reproduzirEventos: vi.fn(() => Promise.resolve()),
}));

function criarFixtures() {
  return {
    jogador: { nome: "Herói", hp: 100, hpMax: 100 },
    inimigo: { nome: "Orc", hp: 30, hpMax: 30 },
  };
}

describe("iniciarBatalha", () => {
  it("atualiza o log após executar a ação atacar", async () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = iniciarBatalha(container, jogador, inimigo);

    await elementos.executarAcao("atacar");

    expect(elementos.log.textContent).toContain("Você causou 7 de dano.");
  });

  it("atualiza as barras de HP após executar a ação atacar", async () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = iniciarBatalha(container, jogador, inimigo);

    await elementos.executarAcao("atacar");

    expect(elementos.barraHpJogador.style.width).toBe("93%");
    expect(elementos.barraHpInimigo.style.width).toBe(
      `${(23 / 30) * 100}%`
    );
  });

  it("reabilita os botões de ação após processar a rodada", async () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = iniciarBatalha(container, jogador, inimigo);

    await elementos.executarAcao("atacar");

    expect(elementos.botaoAtacar.disabled).toBe(false);
    expect(elementos.botaoFugir.disabled).toBe(false);
  });
});
