import { describe, it, expect, vi, afterEach } from "vitest";
import { montarTelaGuilda } from "./telaGuilda.js";

afterEach(() => {
  vi.restoreAllMocks();
});

function jogadorDeTeste() {
  return {
    nome: "Thorin", nivel: 5, xp: 0, ouro: 0, classe: "Guerreiro",
    inventario: [], itens: [], hp: 100, hpMax: 100,
  };
}

describe("montarTelaGuilda", () => {
  it("sorteia e exibe uma missão disponível para o nível do jogador", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const container = document.createElement("div");
    montarTelaGuilda(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    expect(container.querySelector(".descricao-missao").textContent.length).toBeGreaterThan(0);
  });

  it('mostra "sem missões disponíveis" quando o jogador não atende o nível mínimo de nenhuma', () => {
    const container = document.createElement("div");
    montarTelaGuilda(container, { jogador: { ...jogadorDeTeste(), nivel: 0 }, aoSair: vi.fn() });
    expect(container.textContent).toContain("Não há missões disponíveis");
  });

  it("resolve uma missão narrativa ao aceitar, mostrando o resultado", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // sorteia missão, e sucesso garantido (resultado baixo)
    const container = document.createElement("div");
    const jogador = jogadorDeTeste();
    const elementos = montarTelaGuilda(container, { jogador, aoSair: vi.fn() });

    elementos.botaoAceitar.click();

    expect(container.querySelector(".resultado-missao")).not.toBeNull();
  });

  it("mostra a celebração de level up quando a missão dá XP suficiente pra upar", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const container = document.createElement("div");
    // nivel 1 precisa de 50 XP pro próximo nível (floor(50 * 1^1.4)) — qualquer
    // missão comum elegível no nível 1 dá XP suficiente pra cruzar a partir de 49.
    const jogador = { ...jogadorDeTeste(), nivel: 1, xp: 49, ataque: 10, defesa: 10, hpMax: 100 };
    const elementos = montarTelaGuilda(container, { jogador, aoSair: vi.fn() });

    elementos.botaoAceitar.click();

    expect(jogador.nivel).toBeGreaterThan(1);
    expect(container.querySelector(".resultado-missao").textContent).toContain("Nível");
  });

  it("chama aoSair ao clicar em Voltar", () => {
    const aoSair = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaGuilda(container, { jogador: jogadorDeTeste(), aoSair });
    elementos.botaoSair.click();
    expect(aoSair).toHaveBeenCalledOnce();
  });
});
