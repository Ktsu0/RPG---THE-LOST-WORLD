import { describe, it, expect } from "vitest";
import { criarMapaCidade, POSICAO_INICIAL_CIDADE } from "./cidade.js";
import { alcancavel } from "../grade.js";

const HOTSPOTS_ESPERADOS = [
  "explorar", "guilda", "loja", "personagem", "torre", "masmorra", "arena", "configuracao",
];

describe("criarMapaCidade", () => {
  it("tem exatamente um hotspot para cada destino esperado", () => {
    const grade = criarMapaCidade();
    const hotspots = grade.flat().filter((celula) => celula.tipo === "hotspot");

    expect(hotspots.map((c) => c.conteudo.hotspot).sort()).toEqual([...HOTSPOTS_ESPERADOS].sort());
  });

  it("a posição inicial é uma célula de chão", () => {
    const grade = criarMapaCidade();
    const inicial = grade[POSICAO_INICIAL_CIDADE.y][POSICAO_INICIAL_CIDADE.x];
    expect(inicial.tipo).toBe("chao");
  });

  it.each(HOTSPOTS_ESPERADOS)('o hotspot "%s" é alcançável a partir da posição inicial', (nomeHotspot) => {
    const grade = criarMapaCidade();
    const destino = grade.flat().find((c) => c.conteudo?.hotspot === nomeHotspot);
    expect(alcancavel(grade, POSICAO_INICIAL_CIDADE, destino)).toBe(true);
  });
});
