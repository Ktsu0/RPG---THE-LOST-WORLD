import { describe, it, expect } from "vitest";
import { montarTelaBatalha, atualizarBarras, registrarNoLog, mostrarOverlayFim } from "./telaBatalha.js";

function criarFixtures() {
  return {
    jogador: { nome: "Herói", hp: 80, hpMax: 100 },
    inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
  };
}

describe("montarTelaBatalha", () => {
  it("renderiza os nomes dos dois combatentes", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    montarTelaBatalha(container, { jogador, inimigo });
    const nomes = [...container.querySelectorAll(".nome-combatente")].map(
      (el) => el.textContent
    );
    expect(nomes).toEqual(["Herói", "Orc"]);
  });

  it("renderiza os botões de ação atacar e fugir", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    montarTelaBatalha(container, { jogador, inimigo });
    expect(container.querySelector('[data-acao="atacar"]')).not.toBeNull();
    expect(container.querySelector('[data-acao="fugir"]')).not.toBeNull();
  });

  it("inicializa as barras de HP de acordo com o HP atual", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });
    expect(elementos.barraHpJogador.style.width).toBe("80%");
    expect(elementos.barraHpInimigo.style.width).toBe("50%");
  });
});

describe("atualizarBarras", () => {
  it("recalcula a largura das barras conforme o HP muda", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });
    jogador.hp = 20;
    atualizarBarras(elementos, jogador, inimigo);
    expect(elementos.barraHpJogador.style.width).toBe("20%");
  });

  it("nunca deixa a largura da barra abaixo de 0%", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });
    jogador.hp = -50;
    atualizarBarras(elementos, jogador, inimigo);
    expect(elementos.barraHpJogador.style.width).toBe("0%");
  });
});

describe("registrarNoLog", () => {
  it("adiciona uma linha de texto ao painel de log", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });
    registrarNoLog(elementos, "Você causou 7 de dano.");
    expect(elementos.log.textContent).toContain("Você causou 7 de dano.");
  });
});

describe("mostrarOverlayFim", () => {
  it("exibe o overlay de vitória com xp/ouro", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });

    mostrarOverlayFim(elementos, { tipo: "vitoria", xpGanho: 15, ouroGanho: 20 });

    expect(elementos.overlayFim.classList.contains("overlay-fim--oculto")).toBe(false);
    expect(elementos.overlayFim.textContent).toContain("Vitória");
    expect(elementos.overlayFim.textContent).toContain("15");
    expect(elementos.overlayFim.textContent).toContain("20");
  });

  it("exibe o overlay de derrota", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });

    mostrarOverlayFim(elementos, { tipo: "derrota" });

    expect(elementos.overlayFim.textContent).toContain("Derrota");
  });

  it("mostra uma linha extra quando eventosLevelUp não está vazio", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });

    mostrarOverlayFim(elementos, {
      tipo: "vitoria", xpGanho: 10, ouroGanho: 5,
      eventosLevelUp: [{ tipo: "level_up", nivel: 4, hpMax: 145 }],
    });

    expect(elementos.overlayFim.textContent).toContain("Nível 4");
    expect(elementos.overlayFim.textContent).toContain("145");
  });

  it("não mostra nada extra quando eventosLevelUp está vazio ou ausente", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });

    mostrarOverlayFim(elementos, { tipo: "vitoria", xpGanho: 10, ouroGanho: 5 });

    expect(elementos.overlayFim.textContent).not.toContain("Nível");
  });
});

describe("sprite inicial e orientação", () => {
  it("já mostra o sprite (idle) de ambos os combatentes assim que a tela monta, sem esperar uma ação", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });
    expect(elementos.spriteJogador.style.backgroundImage).toContain("/assets/personagens/");
    expect(elementos.spriteInimigo.style.backgroundImage).toContain("/assets/personagens/");
  });

  it("o sprite do inimigo é espelhado pra ficar de frente pro jogador", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });
    expect(elementos.spriteInimigo.classList.contains("sprite--espelhado")).toBe(true);
    expect(elementos.spriteJogador.classList.contains("sprite--espelhado")).toBe(false);
  });
});

describe("seleção de sprite do inimigo", () => {
  it("usa o sprite mapeado para o nome do inimigo", () => {
    const container = document.createElement("div");
    const elementos = montarTelaBatalha(container, {
      jogador: { nome: "Herói", hp: 80, hpMax: 100 },
      inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
    });
    expect(elementos.personagemInimigo).toBe("orc");
    expect(elementos.combatenteInimigo.querySelector(".sprite").dataset.personagem).toBe("orc");
  });

  it("cai no sprite padrão para um inimigo sem mapeamento conhecido", () => {
    const container = document.createElement("div");
    const elementos = montarTelaBatalha(container, {
      jogador: { nome: "Herói", hp: 80, hpMax: 100 },
      inimigo: { nome: "Criatura Desconhecida", hp: 15, hpMax: 30 },
    });
    expect(elementos.personagemInimigo).toBe("orc");
  });
});

describe("cenário de fundo por local", () => {
  it("usa a classe do local de treino por padrão", () => {
    const container = document.createElement("div");
    montarTelaBatalha(container, {
      jogador: { nome: "Herói", hp: 80, hpMax: 100 },
      inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
    });
    expect(container.querySelector(".palco-batalha").classList.contains("palco-batalha--treino")).toBe(true);
  });

  it("usa a classe do local passado explicitamente", () => {
    const container = document.createElement("div");
    montarTelaBatalha(container, {
      jogador: { nome: "Herói", hp: 80, hpMax: 100 },
      inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
      local: "masmorra",
    });
    expect(container.querySelector(".palco-batalha").classList.contains("palco-batalha--masmorra")).toBe(true);
  });
});

describe("barra de ações completa", () => {
  it("tem os 4 botões: atacar, item, defender, fugir", () => {
    const container = document.createElement("div");
    montarTelaBatalha(container, {
      jogador: { nome: "Herói", hp: 80, hpMax: 100, itens: ["Poção de Cura"], inventario: [] },
      inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
    });
    for (const acao of ["atacar", "usar_pocao", "defender", "fugir"]) {
      expect(container.querySelector(`[data-acao="${acao}"]`)).not.toBeNull();
    }
  });

  it("o botão de item mostra a contagem de poções e desabilita com 0", () => {
    const container = document.createElement("div");
    const elementos = montarTelaBatalha(container, {
      jogador: { nome: "Herói", hp: 80, hpMax: 100, itens: [], inventario: [] },
      inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
    });
    expect(elementos.botaoItem.textContent).toContain("0");
    expect(elementos.botaoItem.disabled).toBe(true);
  });
});
