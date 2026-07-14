import { describe, it, expect } from "vitest";
import { validarNome, calcularAtributosIniciais, criarPersonagem } from "./criarPersonagem.js";

describe("validarNome", () => {
  it("aceita um nome não vazio", () => {
    expect(validarNome("Thorin")).toBe(true);
  });

  it("rejeita string vazia", () => {
    expect(validarNome("")).toBe(false);
  });

  it("rejeita string só com espaços", () => {
    expect(validarNome("   ")).toBe(false);
  });

  it("rejeita valores não-string", () => {
    expect(validarNome(undefined)).toBe(false);
    expect(validarNome(null)).toBe(false);
  });
});

describe("calcularAtributosIniciais", () => {
  it("combina bônus de raça e classe (Anão + Arqueiro)", () => {
    const atributos = calcularAtributosIniciais("Anão", "Arqueiro");
    // hp = 100 + 0 (Anão), ataque = 5 + (-3) + 0 = 2, defesa = 5 + 15 + 0 = 20
    expect(atributos).toEqual({ hp: 100, hpMax: 100, ataque: 2, defesa: 20 });
  });

  it("combina bônus de raça e classe (Morto-vivo + Bárbaro)", () => {
    const atributos = calcularAtributosIniciais("Morto-vivo", "Bárbaro");
    // hp = 100 - 10 = 90, ataque = 5 + 5 + 8 = 18, defesa = 5 + 0 + 0 = 5
    expect(atributos).toEqual({ hp: 90, hpMax: 90, ataque: 18, defesa: 5 });
  });
});

describe("criarPersonagem", () => {
  it("cria um jogador com o shape completo esperado pelo engine de combate", () => {
    const jogador = criarPersonagem({ nome: "Thorin", racaNome: "Anão", classeNome: "Arqueiro" });

    expect(jogador).toEqual({
      nome: "Thorin",
      raca: "Anão",
      classe: "Arqueiro",
      habilidadeClasse: "esquiva",
      bonusClasse: {
        habilidade: "esquiva", atk: 0, def: 0, dropOuro: 10, dropItem: 0,
        critChance: 0, esquiva: 10, bloqueioChance: 0,
      },
      hp: 100, hpMax: 100,
      nivel: 1, xp: 0, ouro: 50,
      ataque: 2, defesa: 20,
      bonusRaca: { hp: 0, atk: -3, def: 15, critChance: 0 },
      restricoes: {},
      equipamentos: { head: null, chest: null, hands: null, legs: null, feet: null },
      itens: [], inventario: [], armas: [],
      armaEquipada: null, amuletoEquipado: false, amuletoCraftado: false, status: [],
      ativarHistoria: true,
    });
  });

  it("remove espaços extras do nome", () => {
    const jogador = criarPersonagem({ nome: "  Gimli  ", racaNome: "Anão", classeNome: "Paladino" });
    expect(jogador.nome).toBe("Gimli");
  });

  it("aplica a restrição semArmadura do Dragonoide", () => {
    const jogador = criarPersonagem({ nome: "Draco", racaNome: "Dragonoide", classeNome: "Xamã" });
    expect(jogador.restricoes).toEqual({ semArmadura: true });
  });

  it("lança erro quando o nome é inválido", () => {
    expect(() => criarPersonagem({ nome: "  ", racaNome: "Anão", classeNome: "Arqueiro" })).toThrow(
      "Nome do personagem não pode ser vazio."
    );
  });

  it("lança erro quando a raça não existe", () => {
    expect(() => criarPersonagem({ nome: "X", racaNome: "Anjo", classeNome: "Arqueiro" })).toThrow(
      'Raça "Anjo" não existe.'
    );
  });
});
