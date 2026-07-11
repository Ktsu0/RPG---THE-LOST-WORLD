import { describe, it, expect, vi } from "vitest";
import { montarMundoTiles } from "./rendererTiles.js";

function gradeSimples() {
  return [
    [
      { x: 0, y: 0, tipo: "chao", conteudo: null },
      { x: 1, y: 0, tipo: "hotspot", conteudo: { hotspot: "loja", rotulo: "Loja" } },
    ],
    [
      { x: 0, y: 1, tipo: "parede", conteudo: null },
      { x: 1, y: 1, tipo: "chao", conteudo: null },
    ],
  ];
}

describe("montarMundoTiles", () => {
  it("renderiza uma célula por posição da grade, com o marcador do jogador na posição inicial", () => {
    const container = document.createElement("div");
    montarMundoTiles(container, { grade: gradeSimples(), posicaoInicial: { x: 0, y: 0 }, aoMover: () => {} });

    expect(container.querySelectorAll(".celula-mundo")).toHaveLength(4);
    const celulaInicial = container.querySelector('[data-x="0"][data-y="0"]');
    expect(celulaInicial.querySelector(".jogador-mundo")).not.toBeNull();
  });

  it("move o jogador ao clicar numa célula adjacente e chama aoMover com a célula de destino", () => {
    const container = document.createElement("div");
    const aoMover = vi.fn();
    montarMundoTiles(container, { grade: gradeSimples(), posicaoInicial: { x: 0, y: 0 }, aoMover });

    container.querySelector('[data-x="1"][data-y="0"]').click();

    expect(aoMover).toHaveBeenCalledWith(expect.objectContaining({ x: 1, y: 0, tipo: "hotspot" }));
    expect(container.querySelector('[data-x="1"][data-y="0"] .jogador-mundo')).not.toBeNull();
  });

  it("ignora clique numa célula de parede", () => {
    const container = document.createElement("div");
    const aoMover = vi.fn();
    montarMundoTiles(container, { grade: gradeSimples(), posicaoInicial: { x: 1, y: 1 }, aoMover });

    container.querySelector('[data-x="0"][data-y="1"]').click();

    expect(aoMover).not.toHaveBeenCalled();
    expect(container.querySelector('[data-x="1"][data-y="1"] .jogador-mundo')).not.toBeNull();
  });

  it("move com as setas do teclado", () => {
    const container = document.createElement("div");
    const aoMover = vi.fn();
    montarMundoTiles(container, { grade: gradeSimples(), posicaoInicial: { x: 0, y: 0 }, aoMover });

    container.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

    expect(aoMover).toHaveBeenCalledWith(expect.objectContaining({ x: 1, y: 0 }));
  });

  it("caminha em vários passos até uma célula distante (pathfinding) e chama aoMover a cada passo", () => {
    const gradeLinha = [[
      { x: 0, y: 0, tipo: "chao", conteudo: null },
      { x: 1, y: 0, tipo: "chao", conteudo: null },
      { x: 2, y: 0, tipo: "hotspot", conteudo: { hotspot: "loja", rotulo: "Loja" } },
    ]];
    const container = document.createElement("div");
    const aoMover = vi.fn();
    montarMundoTiles(container, { grade: gradeLinha, posicaoInicial: { x: 0, y: 0 }, aoMover });

    container.querySelector('[data-x="2"][data-y="0"]').click();

    expect(aoMover).toHaveBeenCalledTimes(2);
    expect(aoMover).toHaveBeenLastCalledWith(expect.objectContaining({ x: 2, y: 0, tipo: "hotspot" }));
    expect(container.querySelector('[data-x="2"][data-y="0"] .jogador-mundo')).not.toBeNull();
  });
});
