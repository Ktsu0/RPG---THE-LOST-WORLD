import { describe, it, expect, vi } from "vitest";
import { montarTelaCidade } from "./telaCidade.js";

function jogadorDeTeste() {
  return { nome: "Thorin", nivel: 3, hp: 80, hpMax: 100, ouro: 120 };
}

describe("montarTelaCidade", () => {
  it("exibe nome, nível, HP e ouro do jogador no cabeçalho", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, { jogador: jogadorDeTeste(), aoExplorar: vi.fn() });
    const texto = container.querySelector(".cabecalho-cidade").textContent;
    expect(texto).toContain("Thorin");
    expect(texto).toContain("Nível 3");
    expect(texto).toContain("80/100");
    expect(texto).toContain("120");
  });

  it("nenhum local está mais desabilitado (Fase 4 completa todos os modos)", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, {
      jogador: jogadorDeTeste(), aoExplorar: vi.fn(), aoAbrirGuilda: vi.fn(), aoAbrirLoja: vi.fn(),
      aoAbrirPersonagem: vi.fn(), aoAbrirTorre: vi.fn(), aoAbrirMasmorra: vi.fn(), aoAbrirArena: vi.fn(),
      aoAbrirConfiguracao: vi.fn(),
    });
    for (const local of ["guilda", "loja", "personagem", "torre", "masmorra", "arena", "configuracao"]) {
      expect(container.querySelector(`[data-local="${local}"]`).disabled).toBe(false);
    }
  });

  it("chama aoAbrirConfiguracao ao clicar no botão de configurações", () => {
    const aoAbrirConfiguracao = vi.fn();
    const container = document.createElement("div");
    montarTelaCidade(container, {
      jogador: jogadorDeTeste(), aoExplorar: vi.fn(), aoAbrirGuilda: vi.fn(), aoAbrirLoja: vi.fn(),
      aoAbrirPersonagem: vi.fn(), aoAbrirTorre: vi.fn(), aoAbrirMasmorra: vi.fn(), aoAbrirArena: vi.fn(),
      aoAbrirConfiguracao,
    });
    container.querySelector('[data-local="configuracao"]').click();
    expect(aoAbrirConfiguracao).toHaveBeenCalledOnce();
  });

  it("chama aoAbrirTorre, aoAbrirMasmorra e aoAbrirArena ao clicar nos respectivos botões", () => {
    const aoAbrirTorre = vi.fn();
    const aoAbrirMasmorra = vi.fn();
    const aoAbrirArena = vi.fn();
    const container = document.createElement("div");
    montarTelaCidade(container, {
      jogador: jogadorDeTeste(), aoExplorar: vi.fn(), aoAbrirGuilda: vi.fn(), aoAbrirLoja: vi.fn(),
      aoAbrirPersonagem: vi.fn(), aoAbrirTorre, aoAbrirMasmorra, aoAbrirArena,
    });
    container.querySelector('[data-local="torre"]').click();
    container.querySelector('[data-local="masmorra"]').click();
    container.querySelector('[data-local="arena"]').click();
    expect(aoAbrirTorre).toHaveBeenCalledOnce();
    expect(aoAbrirMasmorra).toHaveBeenCalledOnce();
    expect(aoAbrirArena).toHaveBeenCalledOnce();
  });

  it("chama aoAbrirGuilda, aoAbrirLoja e aoAbrirPersonagem ao clicar nos respectivos botões", () => {
    const aoAbrirGuilda = vi.fn();
    const aoAbrirLoja = vi.fn();
    const aoAbrirPersonagem = vi.fn();
    const container = document.createElement("div");
    montarTelaCidade(container, {
      jogador: jogadorDeTeste(), aoExplorar: vi.fn(), aoAbrirGuilda, aoAbrirLoja, aoAbrirPersonagem,
    });

    container.querySelector('[data-local="guilda"]').click();
    container.querySelector('[data-local="loja"]').click();
    container.querySelector('[data-local="personagem"]').click();

    expect(aoAbrirGuilda).toHaveBeenCalledOnce();
    expect(aoAbrirLoja).toHaveBeenCalledOnce();
    expect(aoAbrirPersonagem).toHaveBeenCalledOnce();
  });

  it("chama aoExplorar ao clicar no botão Explorar", () => {
    const aoExplorar = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaCidade(container, { jogador: jogadorDeTeste(), aoExplorar });
    elementos.botaoExplorar.click();
    expect(aoExplorar).toHaveBeenCalledOnce();
  });
});
