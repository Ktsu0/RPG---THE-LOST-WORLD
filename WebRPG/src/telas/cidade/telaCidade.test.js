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

  it("desabilita os locais ainda não implementados", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, { jogador: jogadorDeTeste(), aoExplorar: vi.fn() });
    for (const local of ["guilda", "loja", "torre", "masmorra", "arena"]) {
      const botao = container.querySelector(`[data-local="${local}"]`);
      expect(botao.disabled).toBe(true);
      expect(botao.textContent).toContain("Em breve");
    }
  });

  it("chama aoExplorar ao clicar no botão Explorar", () => {
    const aoExplorar = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaCidade(container, { jogador: jogadorDeTeste(), aoExplorar });
    elementos.botaoExplorar.click();
    expect(aoExplorar).toHaveBeenCalledOnce();
  });
});
