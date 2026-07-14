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

  it("mostra um ícone para cada item do inventário", () => {
    const container = document.createElement("div");
    montarTelaPersonagem(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    const icone = container.querySelector(".item-inventario .icone-item");
    expect(icone).not.toBeNull();
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

describe("painel do Amuleto Supremo", () => {
  function jogadorComMateriaisCompletos() {
    return {
      ...jogadorDeTeste(),
      inventario: [
        ...jogadorDeTeste().inventario,
        "Pena do Corvo Sombrio", "Pena do Corvo Sombrio", "Pena do Corvo Sombrio", "Pena do Corvo Sombrio", "Pena do Corvo Sombrio",
        "Pergaminho Arcano", "Pergaminho Arcano", "Pergaminho Arcano", "Pergaminho Arcano", "Pergaminho Arcano",
        "Essência da Noite", "Essência da Noite",
        "Relíquia Brilhante", "Relíquia Brilhante",
        "Gema da Escuridão",
      ],
      amuletoCraftado: false, amuletoEquipado: false,
    };
  }

  it("mostra o progresso de cada material necessário", () => {
    const container = document.createElement("div");
    montarTelaPersonagem(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    const texto = container.querySelector(".painel-amuleto").textContent;
    expect(texto).toContain("Pena do Corvo Sombrio");
    expect(texto).toContain("0/5");
  });

  it("habilita Craftar só quando todos os materiais estão completos", () => {
    const container = document.createElement("div");
    montarTelaPersonagem(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    expect(container.querySelector("#botao-craftar-amuleto").disabled).toBe(true);

    const container2 = document.createElement("div");
    montarTelaPersonagem(container2, { jogador: jogadorComMateriaisCompletos(), aoSair: vi.fn() });
    expect(container2.querySelector("#botao-craftar-amuleto").disabled).toBe(false);
  });

  it("craftar consome os materiais e troca o botão por Equipar/Desequipar", () => {
    const container = document.createElement("div");
    const jogador = jogadorComMateriaisCompletos();
    montarTelaPersonagem(container, { jogador, aoSair: vi.fn() });
    container.querySelector("#botao-craftar-amuleto").click();
    expect(jogador.amuletoCraftado).toBe(true);
    expect(container.querySelector("#botao-alternar-amuleto")).not.toBeNull();
    expect(container.querySelector("#botao-craftar-amuleto")).toBeNull();
  });

  it("equipar aplica o bônus e desequipar reverte", () => {
    const container = document.createElement("div");
    // ataque alto o bastante pra +5% arredondar pra cima de forma visível
    // (o fixture padrão tem ataque: 12, onde floor(12*1.05) === 12).
    const jogador = { ...jogadorComMateriaisCompletos(), ataque: 100, amuletoCraftado: true };
    montarTelaPersonagem(container, { jogador, aoSair: vi.fn() });
    const botao = container.querySelector("#botao-alternar-amuleto");
    const ataqueAntes = jogador.ataque;
    botao.click();
    expect(jogador.amuletoEquipado).toBe(true);
    expect(jogador.ataque).toBeGreaterThan(ataqueAntes);

    container.querySelector("#botao-alternar-amuleto").click();
    expect(jogador.amuletoEquipado).toBe(false);
    expect(jogador.ataque).toBe(ataqueAntes);
  });
});

describe("painel do Talismã da Torre", () => {
  it("mostra o progresso de fragmentos e ouro", () => {
    const container = document.createElement("div");
    const jogador = { ...jogadorDeTeste(), inventario: [...jogadorDeTeste().inventario, "Fragmento Antigo", "Fragmento Antigo"], ouro: 500 };
    montarTelaPersonagem(container, { jogador, aoSair: vi.fn() });
    const texto = container.querySelector(".painel-talisma").textContent;
    expect(texto).toContain("2/10");
    expect(texto).toContain("500/2000");
  });

  it("craftar consome fragmentos e ouro, e some o botao (o item vai pro inventario)", () => {
    const container = document.createElement("div");
    const jogador = {
      ...jogadorDeTeste(),
      inventario: [...jogadorDeTeste().inventario, ...Array(10).fill("Fragmento Antigo")],
      ouro: 2000,
    };
    montarTelaPersonagem(container, { jogador, aoSair: vi.fn() });
    container.querySelector("#botao-craftar-talisma").click();
    expect(jogador.inventario.filter((i) => i === "Talismã da Torre")).toHaveLength(1);
    expect(jogador.ouro).toBe(0);
  });

  it("mostra que ja possui um talisma pronto, sem oferecer craftar de novo", () => {
    const container = document.createElement("div");
    const jogador = { ...jogadorDeTeste(), inventario: [...jogadorDeTeste().inventario, "Talismã da Torre"] };
    montarTelaPersonagem(container, { jogador, aoSair: vi.fn() });
    expect(container.querySelector(".painel-talisma").textContent).toContain("pronto");
    expect(container.querySelector("#botao-craftar-talisma")).toBeNull();
  });
});
