import { describe, it, expect, vi, afterEach } from "vitest";
import {
  verificarEsquivaInimigo,
  verificarAtaqueDuplo,
  verificarEnvenenamentoAoAtacar,
} from "./habilidadesInimigo.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("verificarEsquivaInimigo", () => {
  it("retorna false quando a habilidade não é esquiva", () => {
    expect(verificarEsquivaInimigo({ habilidade: null })).toBe(false);
  });

  it("retorna true quando a habilidade é esquiva e a chance acerta", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1, <=15 sucesso
    expect(verificarEsquivaInimigo({ habilidade: "esquiva" })).toBe(true);
  });

  it("retorna false quando a habilidade é esquiva mas a chance falha", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99); // rand(1,100)=100, >15 falha
    expect(verificarEsquivaInimigo({ habilidade: "esquiva" })).toBe(false);
  });
});

describe("verificarAtaqueDuplo", () => {
  it("retorna false quando a habilidade não é ataque_duplo", () => {
    expect(verificarAtaqueDuplo({ habilidade: null })).toBe(false);
  });

  it("retorna true quando a habilidade é ataque_duplo e a chance acerta", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(verificarAtaqueDuplo({ habilidade: "ataque_duplo" })).toBe(true);
  });

  it("retorna false quando a habilidade é ataque_duplo mas a chance falha", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(verificarAtaqueDuplo({ habilidade: "ataque_duplo" })).toBe(false);
  });
});

describe("verificarEnvenenamentoAoAtacar", () => {
  it("não aplica veneno se a habilidade do inimigo não for envenenamento", () => {
    const inimigo = { habilidade: null };
    const jogador = { status: [] };
    expect(verificarEnvenenamentoAoAtacar(inimigo, jogador)).toBe(false);
    expect(jogador.status).toHaveLength(0);
  });

  it("aplica veneno no jogador quando a habilidade é envenenamento e a chance acerta", () => {
    const inimigo = { habilidade: "envenenamento" };
    const jogador = { status: [] };
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1<=20 sucesso; rand(3,5)=3
    expect(verificarEnvenenamentoAoAtacar(inimigo, jogador)).toBe(true);
    expect(jogador.status).toEqual([{ tipo: "envenenamento", duracao: 3, dano: 5 }]);
  });

  it("não aplica veneno quando a chance falha", () => {
    const inimigo = { habilidade: "envenenamento" };
    const jogador = { status: [] };
    vi.spyOn(Math, "random").mockReturnValue(0.99); // rand(1,100)=100>20 falha
    expect(verificarEnvenenamentoAoAtacar(inimigo, jogador)).toBe(false);
    expect(jogador.status).toHaveLength(0);
  });
});
