import { describe, it, expect, vi, afterEach } from "vitest";
import { deveInvocarEsqueleto, quantidadeDeEsqueletos, criarEsqueleto, ataqueEsqueletos, absorverDanoComEsqueletos } from "./necromante.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("deveInvocarEsqueleto", () => {
  it("true para Necromante em rodada múltipla de 4", () => {
    expect(deveInvocarEsqueleto({ classe: "Necromante" }, 4)).toBe(true);
    expect(deveInvocarEsqueleto({ classe: "Necromante" }, 8)).toBe(true);
  });

  it("false para outras classes ou rodadas não múltiplas de 4", () => {
    expect(deveInvocarEsqueleto({ classe: "Guerreiro" }, 4)).toBe(false);
    expect(deveInvocarEsqueleto({ classe: "Necromante" }, 5)).toBe(false);
  });
});

describe("quantidadeDeEsqueletos", () => {
  it("retorna 1 na faixa comum (<=95%)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(quantidadeDeEsqueletos()).toBe(1);
  });

  it("retorna 4 no extremo raro (>99%)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    expect(quantidadeDeEsqueletos()).toBe(4);
  });
});

describe("criarEsqueleto", () => {
  it("escala hp e atk com o nível do jogador", () => {
    const esqueleto = criarEsqueleto({ nivel: 4 });
    expect(esqueleto).toEqual({ hp: 21, atk: 7 }); // 15+floor(4*1.5)=21, 5+floor(4*0.5)=7
  });
});

describe("ataqueEsqueletos", () => {
  it("soma o ataque de todos os esqueletos vivos no inimigo", () => {
    const inimigo = { hp: 50 };
    const esqueletos = [{ hp: 10, atk: 5 }, { hp: 8, atk: 3 }];
    const total = ataqueEsqueletos(inimigo, esqueletos);
    expect(total).toBe(8);
    expect(inimigo.hp).toBe(42);
  });
});

describe("absorverDanoComEsqueletos", () => {
  it("o primeiro esqueleto absorve todo o dano; sobrevive se hp restante > 0", () => {
    const esqueletos = [{ hp: 10, atk: 5 }, { hp: 20, atk: 3 }];
    const resultado = absorverDanoComEsqueletos(esqueletos, 6);
    expect(resultado.danoRestante).toBe(0);
    expect(resultado.esqueletos).toEqual([{ hp: 4, atk: 5 }, { hp: 20, atk: 3 }]);
  });

  it("remove o esqueleto da fila quando ele morre absorvendo o dano", () => {
    const esqueletos = [{ hp: 5, atk: 5 }, { hp: 20, atk: 3 }];
    const resultado = absorverDanoComEsqueletos(esqueletos, 6);
    expect(resultado.danoRestante).toBe(0);
    expect(resultado.esqueletos).toEqual([{ hp: 20, atk: 3 }]);
  });

  it("retorna o dano cheio quando não há esqueletos", () => {
    const resultado = absorverDanoComEsqueletos([], 10);
    expect(resultado).toEqual({ esqueletos: [], danoRestante: 10 });
  });
});
