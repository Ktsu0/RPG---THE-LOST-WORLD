import { describe, it, expect, vi, afterEach } from "vitest";
import { criarSessaoMasmorra, mover, limparSala, tentarSairMasmorra } from "./index.js";

afterEach(() => {
  vi.restoreAllMocks();
});

function jogadorDeTeste() {
  return { nivel: 3, inventario: [], itens: [{ nome: "Poção de Cura" }], armaEquipada: null, equipamentos: {}, ouro: 100 };
}

describe("criarSessaoMasmorra", () => {
  it("inicia a posição do jogador na entrada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const sessao = criarSessaoMasmorra(jogadorDeTeste(), "cripta-esquecida");
    expect(sessao.posicao).toEqual(sessao.dungeon.entrance);
  });
});

describe("mover", () => {
  it("move para uma célula adjacente e marca como visitada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const sessao = criarSessaoMasmorra(jogadorDeTeste(), "cripta-esquecida");
    const resultado = mover(sessao, "norte");
    expect(resultado.saiuDosLimites).toBe(false);
    expect(resultado.sessao.posicao.y).toBe(sessao.posicao.y - 1);
    expect(resultado.celula.visited).toBe(true);
  });

  it("recusa mover para fora da grade", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    let sessao = criarSessaoMasmorra(jogadorDeTeste(), "cripta-esquecida");
    // move até a borda norte
    for (let i = 0; i < sessao.dungeon.size; i++) {
      const resultado = mover(sessao, "norte");
      sessao = resultado.sessao;
    }
    const resultado = mover(sessao, "norte");
    expect(resultado.saiuDosLimites).toBe(true);
  });
});

describe("limparSala", () => {
  it("zera roomType e content da célula atual", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const sessao = criarSessaoMasmorra(jogadorDeTeste(), "cripta-esquecida");
    const { x, y } = sessao.dungeon.bossPos;
    sessao.posicao = { x, y };
    limparSala(sessao);
    expect(sessao.dungeon.grid[y][x].roomType).toBe("vazio");
    expect(sessao.dungeon.grid[y][x].content).toBeNull();
  });
});

describe("tentarSairMasmorra", () => {
  it("sai sem penalidade quando está na entrada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const sessao = criarSessaoMasmorra(jogadorDeTeste(), "cripta-esquecida");
    const resultado = tentarSairMasmorra(sessao);
    expect(resultado).toEqual({ saiu: true, penalidade: null });
  });

  it("aplica penalidade (poção, 40% de chance) quando não está na entrada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // primeira rolagem (poção) <=40 sucesso
    const sessao = criarSessaoMasmorra(jogadorDeTeste(), "cripta-esquecida");
    sessao.posicao = { x: sessao.dungeon.bossPos.x, y: sessao.dungeon.bossPos.y };
    const resultado = tentarSairMasmorra(sessao);
    expect(resultado.saiu).toBe(true);
    expect(resultado.penalidade).toBe("pocao");
  });
});
