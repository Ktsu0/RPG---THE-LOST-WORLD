import { describe, it, expect } from "vitest";
import { criarGradeDeTracado } from "./grade.js";
import { criarSessaoMundo, mover, celulaAtual } from "./index.js";

const legenda = {
  "#": { tipo: "parede", conteudo: null },
  ".": { tipo: "chao", conteudo: null },
  H: { tipo: "hotspot", conteudo: { hotspot: "loja", rotulo: "Loja" } },
};
const grade = criarGradeDeTracado(["###", "#.H", "###"], legenda);

describe("criarSessaoMundo", () => {
  it("começa na posição inicial informada", () => {
    const sessao = criarSessaoMundo(grade, { x: 1, y: 1 });
    expect(sessao.posicao).toEqual({ x: 1, y: 1 });
  });
});

describe("mover", () => {
  it("move para uma célula de chão livre", () => {
    const sessao = criarSessaoMundo(grade, { x: 1, y: 1 });
    const resultado = mover(sessao, "leste");

    expect(resultado.bloqueado).toBe(false);
    expect(resultado.sessao.posicao).toEqual({ x: 2, y: 1 });
    expect(resultado.celula.tipo).toBe("hotspot");
  });

  it("bloqueia o movimento contra uma parede e mantém a posição", () => {
    const sessao = criarSessaoMundo(grade, { x: 1, y: 1 });
    const resultado = mover(sessao, "norte");

    expect(resultado.bloqueado).toBe(true);
    expect(resultado.sessao).toBe(sessao);
    expect(resultado.celula).toEqual(celulaAtual(sessao));
  });

  it("bloqueia o movimento para fora dos limites da grade", () => {
    const gradeParcial = criarGradeDeTracado(["..."], { ".": { tipo: "chao", conteudo: null } });
    const sessao = criarSessaoMundo(gradeParcial, { x: 0, y: 0 });
    const resultado = mover(sessao, "oeste");

    expect(resultado.bloqueado).toBe(true);
  });

  it("lança erro para direção desconhecida", () => {
    const sessao = criarSessaoMundo(grade, { x: 1, y: 1 });
    expect(() => mover(sessao, "cima")).toThrow("Direção desconhecida");
  });
});

describe("celulaAtual", () => {
  it("retorna a célula na posição atual da sessão", () => {
    const sessao = criarSessaoMundo(grade, { x: 1, y: 1 });
    expect(celulaAtual(sessao)).toEqual({ x: 1, y: 1, tipo: "chao", conteudo: null });
  });
});
