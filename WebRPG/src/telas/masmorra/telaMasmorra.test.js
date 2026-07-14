import { describe, it, expect, vi, afterEach } from "vitest";
import { montarTelaMasmorra } from "./telaMasmorra.js";

vi.mock("@audio/musica.js", () => ({ tocarMusica: vi.fn() }));
import { tocarMusica } from "@audio/musica.js";

afterEach(() => {
  vi.restoreAllMocks();
});

function jogadorDeTeste() {
  return {
    nome: "Herói", nivel: 3, hp: 200, hpMax: 200, atk: 20, defesa: 10,
    xp: 0, ouro: 100, inventario: [], itens: [], status: [],
  };
}

function entrarNaPrimeiraMasmorra(container) {
  container.querySelector("[data-template]").click();
}

describe("montarTelaMasmorra", () => {
  it("mostra a lista dos 10 templates antes de criar a sessão", () => {
    const container = document.createElement("div");
    montarTelaMasmorra(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    expect(container.querySelectorAll("[data-template]")).toHaveLength(10);
    expect(container.querySelector(".grade-masmorra")).toBeNull();
  });

  it("escolher um template cria a sessão daquele template", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    montarTelaMasmorra(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    container.querySelector('[data-template="covil-vulcanico"]').click();
    expect(container.querySelector(".grade-masmorra")).not.toBeNull();
    expect(container.textContent).toContain("Covil Vulcânico");
  });

  it("renderiza a grade com células ocultas (não visitadas) e a entrada visível", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    montarTelaMasmorra(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    entrarNaPrimeiraMasmorra(container);
    const celulas = container.querySelectorAll("[data-celula]");
    expect(celulas.length).toBeGreaterThan(0);
    const ocultas = [...celulas].filter((c) => c.classList.contains("celula--oculta"));
    expect(ocultas.length).toBeGreaterThan(0);
  });

  it("mover revela a nova célula", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    const elementos = montarTelaMasmorra(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    entrarNaPrimeiraMasmorra(container);
    elementos.botaoMover("norte").click();
    const celulasVisitadas = container.querySelectorAll(".celula--visitada");
    expect(celulasVisitadas.length).toBeGreaterThanOrEqual(2); // entrada + nova célula
  });

  it("chama aoSair ao sair pela entrada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const aoSair = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaMasmorra(container, { jogador: jogadorDeTeste(), aoSair });
    entrarNaPrimeiraMasmorra(container);
    elementos.botaoSairMasmorra().click();
    expect(aoSair).toHaveBeenCalledOnce();
  });

  it("entrar numa sala de encontro (monstro/miniboss/boss) embute a tela de batalha", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    const elementos = montarTelaMasmorra(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    entrarNaPrimeiraMasmorra(container);

    elementos.botaoMover("leste").click();

    expect(container.querySelector(".tela-batalha")).not.toBeNull();
    const nomes = [...container.querySelectorAll(".nome-combatente")].map((el) => el.textContent);
    expect(nomes.length).toBe(2);
    expect(container.querySelector(".grade-masmorra").style.display).toBe("none");
  });

  it("toca a música da masmorra ao montar a tela", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    montarTelaMasmorra(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    expect(tocarMusica).toHaveBeenCalledWith("masmorra");
  });
});
