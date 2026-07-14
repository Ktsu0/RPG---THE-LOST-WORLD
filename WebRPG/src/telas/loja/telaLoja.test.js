import { describe, it, expect, vi } from "vitest";
import { montarTelaLoja } from "./telaLoja.js";

function jogadorDeTeste() {
  return { nome: "Thorin", ouro: 3000, inventario: [] };
}

describe("montarTelaLoja", () => {
  it("lista os itens do catálogo com preço", () => {
    const container = document.createElement("div");
    montarTelaLoja(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    const itens = container.querySelectorAll("[data-item-loja]");
    expect(itens.length).toBeGreaterThan(0);
  });

  it("compra um item ao clicar, debita o ouro e atualiza o cabeçalho", () => {
    const container = document.createElement("div");
    const jogador = jogadorDeTeste();
    montarTelaLoja(container, { jogador, aoSair: vi.fn() });

    const botaoEspada = [...container.querySelectorAll("[data-item-loja]")].find((el) =>
      el.textContent.includes("Espada Longa")
    );
    botaoEspada.querySelector("[data-acao='comprar']").click();

    expect(jogador.ouro).toBe(500); // 3000 - 2500
    expect(jogador.inventario.some((i) => i.nome === "Espada Longa")).toBe(true);
    expect(container.querySelector(".ouro-atual").textContent).toContain("500");
  });

  it("chama aoSair ao clicar em Sair", () => {
    const aoSair = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaLoja(container, { jogador: jogadorDeTeste(), aoSair });
    elementos.botaoSair.click();
    expect(aoSair).toHaveBeenCalledOnce();
  });

  it("mostra um ícone para cada item da lista de compra", () => {
    const container = document.createElement("div");
    montarTelaLoja(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    const icone = container.querySelector(".item-loja .icone-item");
    expect(icone).not.toBeNull();
  });

  it("aba Vender lista os itens vendíveis do inventário e vende ao confirmar", () => {
    const jogador = { nome: "Thorin", ouro: 0, inventario: [{ nome: "Espada Longa", slot: "weapon", preco: 2500 }] };
    const container = document.createElement("div");
    const elementos = montarTelaLoja(container, { jogador, aoSair: vi.fn() });

    elementos.abaVender.click();
    container.querySelector('[data-vender-indice="0"]').click();
    container.querySelector("[data-acao='confirmar-venda']").click();

    expect(jogador.ouro).toBe(750); // floor(2500*0.3)
    expect(jogador.inventario).toHaveLength(0);
  });
});
