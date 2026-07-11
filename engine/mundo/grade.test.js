import { describe, it, expect } from "vitest";
import { criarGradeDeTracado, celulaEm, caminhoAte, alcancavel } from "./grade.js";

const legenda = {
  "#": { tipo: "parede", conteudo: null },
  ".": { tipo: "chao", conteudo: null },
};

describe("criarGradeDeTracado", () => {
  it("converte um traçado de strings numa grade de células com coordenadas", () => {
    const grade = criarGradeDeTracado(["##", ".#"], legenda);

    expect(grade).toHaveLength(2);
    expect(grade[0]).toHaveLength(2);
    expect(grade[0][0]).toEqual({ x: 0, y: 0, tipo: "parede", conteudo: null });
    expect(grade[1][0]).toEqual({ x: 0, y: 1, tipo: "chao", conteudo: null });
  });

  it("lança erro para símbolo fora da legenda", () => {
    expect(() => criarGradeDeTracado(["#X"], legenda)).toThrow('Símbolo "X"');
  });
});

describe("celulaEm", () => {
  const grade = criarGradeDeTracado(["..", ".."], legenda);

  it("retorna a célula quando dentro dos limites", () => {
    expect(celulaEm(grade, 1, 1)).toEqual({ x: 1, y: 1, tipo: "chao", conteudo: null });
  });

  it("retorna null fora dos limites", () => {
    expect(celulaEm(grade, -1, 0)).toBeNull();
    expect(celulaEm(grade, 2, 0)).toBeNull();
    expect(celulaEm(grade, 0, -1)).toBeNull();
    expect(celulaEm(grade, 0, 2)).toBeNull();
  });
});

describe("caminhoAte", () => {
  it("retorna um array vazio quando origem e destino são a mesma célula", () => {
    const grade = criarGradeDeTracado(["..."], legenda);
    expect(caminhoAte(grade, { x: 1, y: 0 }, { x: 1, y: 0 })).toEqual([]);
  });

  it("retorna a sequência de células até o destino, sem incluir a origem", () => {
    const grade = criarGradeDeTracado(["...."], legenda);
    const caminho = caminhoAte(grade, { x: 0, y: 0 }, { x: 3, y: 0 });
    expect(caminho.map(({ x, y }) => ({ x, y }))).toEqual([
      { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },
    ]);
  });

  it("retorna null quando o destino é uma parede ou está inalcançável", () => {
    const grade = criarGradeDeTracado(["...", "###", "..."], legenda);
    expect(caminhoAte(grade, { x: 0, y: 0 }, { x: 2, y: 2 })).toBeNull();
  });
});

describe("alcancavel", () => {
  it("retorna true quando existe caminho sem paredes entre origem e destino", () => {
    const grade = criarGradeDeTracado(["...", "#.#", "..."], legenda);
    expect(alcancavel(grade, { x: 0, y: 0 }, { x: 2, y: 2 })).toBe(true);
  });

  it("retorna false quando paredes bloqueiam todo o caminho", () => {
    const grade = criarGradeDeTracado(["...", "###", "..."], legenda);
    expect(alcancavel(grade, { x: 0, y: 0 }, { x: 2, y: 2 })).toBe(false);
  });
});
