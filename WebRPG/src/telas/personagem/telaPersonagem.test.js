import { describe, it, expect, vi } from "vitest";
import { montarTelaPersonagem } from "./telaPersonagem.js";

function jogadorDeTeste() {
  return {
    nome: "Thorin", raca: "Anão", classe: "Arqueiro", nivel: 2, xp: 10, ouro: 500,
    hp: 90, hpMax: 100, ataque: 12, defesa: 20,
    equipamentos: { head: null, chest: null, hands: null, legs: null, feet: null },
    armaEquipada: null,
    inventario: [
      { nome: "Elmo de Ferro", slot: "head", defesa: 6, atkBonus: 0, preco: 2050, set: "Ferro", raridade: "comum" },
      { nome: "Espada Longa", slot: "weapon", atk: 5, preco: 2500, efeito: null, raridade: "comum" },
    ],
  };
}

describe("montarTelaPersonagem", () => {
  it("exibe os atributos e o progresso de XP", () => {
    const container = document.createElement("div");
    montarTelaPersonagem(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    const texto = container.querySelector(".painel-atributos").textContent;
    expect(texto).toContain("Thorin");
    expect(texto).toContain("Anão");
    expect(texto).toContain("Arqueiro");
    expect(texto).toContain("Nível 2");
  });

  it("lista os itens do inventário equipáveis, com a diferença de atributo em relação ao equipado", () => {
    const container = document.createElement("div");
    montarTelaPersonagem(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    const linhaElmo = [...container.querySelectorAll("[data-inventario-item]")].find((el) =>
      el.textContent.includes("Elmo de Ferro")
    );
    // slot vazio -> diferença = valor cheio do item: DEF +6
    expect(linhaElmo.querySelector(".diferenca-defesa").textContent).toContain("+6");
  });

  it("equipa uma armadura do inventário ao clicar, e a peça anterior (se houver) volta pro inventário", () => {
    const container = document.createElement("div");
    const jogador = jogadorDeTeste();
    montarTelaPersonagem(container, { jogador, aoSair: vi.fn() });

    const linhaElmo = [...container.querySelectorAll("[data-inventario-item]")].find((el) =>
      el.textContent.includes("Elmo de Ferro")
    );
    linhaElmo.querySelector("[data-acao='equipar']").click();

    expect(jogador.equipamentos.head.nome).toBe("Elmo de Ferro");
    expect(jogador.inventario.some((i) => i.nome === "Elmo de Ferro")).toBe(false);
    // A tela precisa refletir o bônus de defesa do item recém-equipado (+6),
    // não só o atributo base do jogador.
    expect(container.querySelector(".painel-atributos").textContent).toContain("Defesa: 26");
  });

  it("equipa uma arma do inventário ao clicar", () => {
    const container = document.createElement("div");
    const jogador = jogadorDeTeste();
    montarTelaPersonagem(container, { jogador, aoSair: vi.fn() });

    const linhaArma = [...container.querySelectorAll("[data-inventario-item]")].find((el) =>
      el.textContent.includes("Espada Longa")
    );
    linhaArma.querySelector("[data-acao='equipar']").click();

    expect(jogador.armaEquipada.nome).toBe("Espada Longa");
  });

  it("não lista materiais de craft (strings soltas, ex. recompensa de missão) como equipáveis", () => {
    const container = document.createElement("div");
    const jogador = { ...jogadorDeTeste(), inventario: [...jogadorDeTeste().inventario, "Pena do Corvo Sombrio"] };
    montarTelaPersonagem(container, { jogador, aoSair: vi.fn() });
    const itens = [...container.querySelectorAll("[data-inventario-item]")];
    expect(itens.some((el) => el.textContent.includes("undefined"))).toBe(false);
    expect(itens).toHaveLength(2); // só Elmo de Ferro e Espada Longa, não a string solta
  });

  it("chama aoSair ao clicar em Voltar", () => {
    const aoSair = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaPersonagem(container, { jogador: jogadorDeTeste(), aoSair });
    elementos.botaoSair.click();
    expect(aoSair).toHaveBeenCalledOnce();
  });
});
