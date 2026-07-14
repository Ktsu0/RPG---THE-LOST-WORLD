import { describe, it, expect, vi, afterEach } from "vitest";
import { montarTelaTorre } from "./telaTorre.js";

vi.mock("@audio/musica.js", () => ({ tocarMusica: vi.fn() }));
import { tocarMusica } from "@audio/musica.js";

afterEach(() => {
  vi.restoreAllMocks();
});

function jogadorDeTeste() {
  return {
    nivel: 5, ataque: 20, defesa: 15, hp: 300, hpMax: 300, xp: 0, ouro: 0,
    equipamentos: {}, bonusAtk: 0, bonusDef: 0, amuletoEquipado: false, armaEquipada: null,
    inventario: ["Talismã da Torre"],
  };
}

describe("montarTelaTorre", () => {
  it("mostra o andar atual e o nome do boss ao entrar", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    montarTelaTorre(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    expect(container.querySelector(".andar-atual").textContent).toContain("1");
    expect(container.querySelector(".nome-boss").textContent).toContain("Guardião de Pedra");
  });

  it("atacar reduz o HP do boss e registra no log", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    const elementos = montarTelaTorre(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    await elementos.executarAcao("atacar");
    expect(elementos.log.textContent.length).toBeGreaterThan(0);
  });

  it("chama aoSair ao clicar em Sair da Torre", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const aoSair = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaTorre(container, { jogador: jogadorDeTeste(), aoSair });
    elementos.botaoSair.click();
    expect(aoSair).toHaveBeenCalledOnce();
  });

  it("mostra o sprite do boss atual", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    montarTelaTorre(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    const spriteBoss = container.querySelector(".sprite-boss");
    expect(spriteBoss).not.toBeNull();
    expect(spriteBoss.style.backgroundImage).toContain("/assets/personagens/");
  });

  it("toca a música da torre ao montar a tela", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    montarTelaTorre(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    expect(tocarMusica).toHaveBeenCalledWith("torre");
  });

  it("bloqueia a entrada sem o Talismã da Torre, com mensagem explicativa", () => {
    const container = document.createElement("div");
    const jogador = { ...jogadorDeTeste(), inventario: [] };
    montarTelaTorre(container, { jogador, aoSair: vi.fn() });
    expect(container.textContent).toContain("Talismã da Torre");
    expect(container.querySelector(".acoes-torre")).toBeNull();
  });

  it("consome o Talisma da Torre ao entrar com sucesso", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    const jogador = jogadorDeTeste();
    montarTelaTorre(container, { jogador, aoSair: vi.fn() });
    expect(jogador.inventario).not.toContain("Talismã da Torre");
  });

  it("derrota desabilita as acoes e mostra como voltar a cidade", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99); // boss sempre acerta um golpe grande
    const container = document.createElement("div");
    const jogador = { ...jogadorDeTeste(), hp: 1, hpMax: 1, ataque: 0 };
    const elementos = montarTelaTorre(container, { jogador, aoSair: vi.fn() });
    await elementos.executarAcao("atacar");
    expect(container.querySelector('[data-acao="atacar"]').disabled).toBe(true);
    expect(container.textContent).toContain("Derrotado");
  });

  it("vencer o 10º boss mostra a vitoria final com o Calice da Vitoria", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5); // nunca bloqueia (blockChance maximo e 25)
    const container = document.createElement("div");
    const jogador = { ...jogadorDeTeste(), ataque: 9999 }; // sempre mata o boss num golpe so
    const elementos = montarTelaTorre(container, { jogador, aoSair: vi.fn() });

    for (let i = 0; i < 10; i++) {
      await elementos.executarAcao("atacar");
    }

    expect(container.querySelector(".overlay-fim-torre").classList.contains("overlay-fim-torre--oculto")).toBe(false);
    expect(container.textContent).toContain("Cálice da Vitória");
    expect(jogador.inventario).toContain("Cálice da Vitória");
    expect(jogador.ouro).toBeGreaterThanOrEqual(10000);
    expect(container.querySelector('[data-acao="atacar"]').disabled).toBe(true);
  });
});
