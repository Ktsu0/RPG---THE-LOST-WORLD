import { describe, it, expect, vi } from "vitest";
import { iniciarBatalha } from "./controladorBatalha.js";
import { executarAcaoJogador } from "@engine/combate/index.js";

// executarAcaoJogador vira vi.fn() (em vez de função solta) para que a suíte
// "iniciarBatalha com onFim" possa sobrescrever o retorno com mockReturnValueOnce
// só na chamada que precisa de fim: "vitoria", sem alterar o comportamento padrão
// (fim: null) usado pelos 3 testes já existentes da Fase 1.
vi.mock("@engine/combate/index.js", () => ({
  criarEstadoBatalha: vi.fn((jogador, inimigo) => ({ jogador, inimigo, rodada: 0 })),
  executarAcaoJogador: vi.fn((estado) => ({
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
  })),
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

describe("iniciarBatalha com onFim", () => {
  it("chama onFim('vitoria', estado) quando a batalha termina em vitória", async () => {
    const onFim = vi.fn();
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = iniciarBatalha(container, jogador, inimigo, { onFim });

    executarAcaoJogador.mockReturnValueOnce({
      estado: {
        jogador: { ...jogador, hp: 93 },
        inimigo: { ...inimigo, hp: 0 },
      },
      eventos: [
        { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 30, critico: false },
        { tipo: "morte", alvo: "inimigo" },
        { tipo: "vitoria", xpGanho: 15, ouroGanho: 20 },
      ],
      fim: "vitoria",
    });

    await elementos.executarAcao("atacar");

    expect(onFim).toHaveBeenCalledOnce();
    expect(onFim).toHaveBeenCalledWith("vitoria", expect.objectContaining({ fim: "vitoria" }));
  });

  it("mostra o overlay de fim quando a batalha termina em vitória", async () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = iniciarBatalha(container, jogador, inimigo);

    executarAcaoJogador.mockReturnValueOnce({
      estado: {
        jogador: { ...jogador, hp: 93 },
        inimigo: { ...inimigo, hp: 0 },
      },
      eventos: [
        { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 30, critico: false },
        { tipo: "morte", alvo: "inimigo" },
        { tipo: "vitoria", xpGanho: 15, ouroGanho: 20 },
      ],
      fim: "vitoria",
    });

    await elementos.executarAcao("atacar");

    expect(elementos.overlayFim.classList.contains("overlay-fim--oculto")).toBe(false);
  });

  it("não quebra quando onFim não é fornecido", async () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = iniciarBatalha(container, jogador, inimigo);

    await expect(elementos.executarAcao("atacar")).resolves.toBeUndefined();
  });

  it("ao vencer com XP suficiente pra upar, o overlay mostra a celebração de level up", async () => {
    const container = document.createElement("div");
    // nivel 1 precisa de 50 XP (floor(50 * 1^1.4)) — xp:999 garante upar.
    const jogador = { nome: "Herói", nivel: 1, xp: 999, hp: 100, hpMax: 100, ataque: 10, defesa: 5 };
    const inimigo = { nome: "Orc", hp: 30, hpMax: 30 };
    const elementos = iniciarBatalha(container, jogador, inimigo);

    executarAcaoJogador.mockReturnValueOnce({
      estado: {
        jogador: { ...jogador, hp: 93 },
        inimigo: { ...inimigo, hp: 0 },
      },
      eventos: [
        { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 30, critico: false },
        { tipo: "morte", alvo: "inimigo" },
        { tipo: "vitoria", xpGanho: 15, ouroGanho: 20 },
      ],
      fim: "vitoria",
    });

    await elementos.executarAcao("atacar");

    expect(elementos.overlayFim.textContent).toContain("Nível");
  });
});
