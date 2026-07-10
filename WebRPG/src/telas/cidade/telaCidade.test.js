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

  it("desabilita apenas os locais que ainda não foram implementados (torre, masmorra, arena)", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, {
      jogador: jogadorDeTeste(),
      aoExplorar: vi.fn(), aoAbrirGuilda: vi.fn(), aoAbrirLoja: vi.fn(), aoAbrirPersonagem: vi.fn(),
    });
    for (const local of ["torre", "masmorra", "arena"]) {
      expect(container.querySelector(`[data-local="${local}"]`).disabled).toBe(true);
    }
    for (const local of ["guilda", "loja", "personagem"]) {
      expect(container.querySelector(`[data-local="${local}"]`).disabled).toBe(false);
    }
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
