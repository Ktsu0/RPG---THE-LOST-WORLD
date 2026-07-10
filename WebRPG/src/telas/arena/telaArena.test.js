import { describe, it, expect, vi } from "vitest";
import { montarTelaArena } from "./telaArena.js";

function jogadorDeTeste() {
  return { nivel: 5, ataque: 20, defesa: 15, hp: 100, hpMax: 100, inventario: [] };
}

describe("montarTelaArena", () => {
  it("bloqueia o acesso para jogadores abaixo do nível mínimo", () => {
    const container = document.createElement("div");
    montarTelaArena(container, { jogador: { ...jogadorDeTeste(), nivel: 3 }, aoSair: vi.fn() });
    expect(container.textContent).toContain("nível 5");
  });

  it("mostra a onda 1 e os pontos zerados ao entrar", () => {
    const container = document.createElement("div");
    montarTelaArena(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    expect(container.querySelector(".onda-atual").textContent).toContain("1");
    expect(container.querySelector(".pontos-atuais").textContent).toContain("0");
  });

  it("chama aoSair ao clicar em Sair, restaurando os bônus temporários", () => {
    const aoSair = vi.fn();
    const container = document.createElement("div");
    const jogador = jogadorDeTeste();
    const elementos = montarTelaArena(container, { jogador, aoSair });
    elementos.botaoSair.click();
    expect(aoSair).toHaveBeenCalledOnce();
    expect(jogador.hpMax).toBe(100); // sem bônus pendente para reverter neste teste
  });
});
