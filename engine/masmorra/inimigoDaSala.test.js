import { describe, it, expect, vi, afterEach } from "vitest";
import { criarInimigoDaSala } from "./inimigoDaSala.js";

afterEach(() => vi.restoreAllMocks());

describe("criarInimigoDaSala", () => {
  it("escala hp/atk/xp/ouro pela dificuldade do nível do jogador (sala de miniboss, sem poder extra)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const celula = { roomType: "miniboss", content: { nome: "Cavaleiro Caído" } };

    expect(criarInimigoDaSala(celula, { nivel: 3 })).toEqual({
      nome: "Cavaleiro Caído",
      hp: 135, hpMax: 135, atk: 36, defesa: 9, xp: 45, ouro: 30,
      habilidade: null, status: [],
    });
  });

  it("aplica o multiplicador de poder da sala de boss", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const celula = { roomType: "boss", content: { nome: "Lich Menor", poder: 1.4 } };

    expect(criarInimigoDaSala(celula, { nivel: 3 })).toEqual({
      nome: "Lich Menor",
      hp: 336, hpMax: 336, atk: 76, defesa: 9, xp: 63, ouro: 42,
      habilidade: null, status: [],
    });
  });

  it("lança erro para um tipo de sala sem encontro", () => {
    const celula = { roomType: "vazio", content: null };
    expect(() => criarInimigoDaSala(celula, { nivel: 3 })).toThrow('Tipo de sala "vazio"');
  });
});
