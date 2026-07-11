import { describe, it, expect, vi, beforeEach } from "vitest";
import { montarTelaCidade } from "./telaCidade.js";

function jogadorDeTeste() {
  return { nome: "Thorin", nivel: 3, hp: 80, hpMax: 100, ouro: 120 };
}

function callbacksDeTeste(overrides = {}) {
  return {
    aoExplorar: vi.fn(), aoAbrirGuilda: vi.fn(), aoAbrirLoja: vi.fn(), aoAbrirPersonagem: vi.fn(),
    aoAbrirTorre: vi.fn(), aoAbrirMasmorra: vi.fn(), aoAbrirArena: vi.fn(), aoAbrirConfiguracao: vi.fn(),
    ...overrides,
  };
}

describe("montarTelaCidade", () => {
  it("exibe nome, nível, HP e ouro do jogador no cabeçalho", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, { jogador: jogadorDeTeste(), ...callbacksDeTeste() });
    const texto = container.querySelector(".cabecalho-cidade").textContent;
    expect(texto).toContain("Thorin");
    expect(texto).toContain("Nível 3");
    expect(texto).toContain("80/100");
    expect(texto).toContain("120");
  });

  it("renderiza um hotspot para cada destino da cidade", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, { jogador: jogadorDeTeste(), ...callbacksDeTeste() });
    for (const local of ["explorar", "guilda", "loja", "personagem", "torre", "masmorra", "arena", "configuracao"]) {
      expect(container.querySelector(`[data-hotspot="${local}"]`)).not.toBeNull();
    }
  });

  it.each([
    ["explorar", "aoExplorar"],
    ["guilda", "aoAbrirGuilda"],
    ["loja", "aoAbrirLoja"],
    ["personagem", "aoAbrirPersonagem"],
    ["torre", "aoAbrirTorre"],
    ["masmorra", "aoAbrirMasmorra"],
    ["arena", "aoAbrirArena"],
    ["configuracao", "aoAbrirConfiguracao"],
  ])('clicar no hotspot "%s" chama %s', (hotspot, nomeCallback) => {
    const container = document.createElement("div");
    const callbacks = callbacksDeTeste();
    montarTelaCidade(container, { jogador: jogadorDeTeste(), ...callbacks });

    container.querySelector(`[data-hotspot="${hotspot}"]`).click();

    expect(callbacks[nomeCallback]).toHaveBeenCalledOnce();
  });
});

describe("onboarding", () => {
  beforeEach(() => localStorage.clear());

  it("mostra a dica de boas-vindas na primeira visita", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, { jogador: jogadorDeTeste(), ...callbacksDeTeste() });
    expect(container.querySelector(".dica-onboarding")).not.toBeNull();
  });

  it("não mostra a dica depois de confirmada", () => {
    localStorage.setItem("webrpg_onboarding_visto", "1");
    const container = document.createElement("div");
    montarTelaCidade(container, { jogador: jogadorDeTeste(), ...callbacksDeTeste() });
    expect(container.querySelector(".dica-onboarding")).toBeNull();
  });

  it("clicar em Entendi remove a dica e grava a flag", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, { jogador: jogadorDeTeste(), ...callbacksDeTeste() });
    container.querySelector("#botao-onboarding-ok").click();
    expect(container.querySelector(".dica-onboarding")).toBeNull();
    expect(localStorage.getItem("webrpg_onboarding_visto")).toBe("1");
  });
});
