import { describe, it, expect, vi, afterEach } from "vitest";
import { criarEstadoOndas, avancarOnda, TOTAL_ONDAS } from "./ondas.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("criarEstadoOndas", () => {
  it("inicializa a onda 1 e zero fragmentos", () => {
    const jogador = { hp: 100, hpMax: 100 };
    const estado = criarEstadoOndas(jogador);
    expect(estado.onda).toBe(1);
    expect(estado.fragmentosGanhos).toBe(0);
  });
});

describe("avancarOnda", () => {
  it("cura 10% do HP máximo e avança a onda ao vencer", () => {
    const jogador = { hp: 50, hpMax: 100 };
    let estado = criarEstadoOndas(jogador);
    vi.spyOn(Math, "random").mockReturnValue(0.99); // sem fragmento (rand(1,100)=100 > 5)

    const resultado = avancarOnda(estado);

    expect(resultado.ondaVencida).toBe(true);
    expect(resultado.fragmentoGanho).toBe(false);
    expect(resultado.estado.onda).toBe(2);
    expect(jogador.hp).toBe(60); // 50 + floor(100*0.1)
  });

  it("concede um Fragmento Antigo com 5% de chance", () => {
    const jogador = { hp: 50, hpMax: 100 };
    let estado = criarEstadoOndas(jogador);
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1 <=5

    const resultado = avancarOnda(estado);

    expect(resultado.fragmentoGanho).toBe(true);
    expect(resultado.estado.fragmentosGanhos).toBe(1);
  });

  it("marca a última onda (10) como a onda final da sequência", () => {
    const jogador = { hp: 100, hpMax: 100 };
    let estado = { ...criarEstadoOndas(jogador), onda: TOTAL_ONDAS };
    vi.spyOn(Math, "random").mockReturnValue(0.99);

    const resultado = avancarOnda(estado);

    expect(resultado.sequenciaCompleta).toBe(true);
  });
});
