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
    inventario: [{ nome: "Talismã da Torre" }],
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
});
