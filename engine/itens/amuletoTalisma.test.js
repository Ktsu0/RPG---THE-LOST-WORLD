import { describe, it, expect } from "vitest";
import {
  REQUISITOS_AMULETO,
  podeCraftarAmuleto,
  craftarAmuleto,
  alternarAmuleto,
  PRECO_TALISMA,
  podeCraftarTalisma,
  craftarTalisma,
} from "./amuletoTalisma.js";

function contarItem(inventario, nome) {
  return inventario.filter((i) => i === nome).length;
}

describe("podeCraftarAmuleto", () => {
  it("retorna false quando faltam itens", () => {
    expect(podeCraftarAmuleto([])).toBe(false);
  });

  it("retorna true quando o inventário atende todos os requisitos", () => {
    const inventario = REQUISITOS_AMULETO.flatMap((r) => Array(r.quantidade).fill(r.nome));
    expect(podeCraftarAmuleto(inventario)).toBe(true);
  });
});

describe("craftarAmuleto", () => {
  it("consome os itens necessários do inventário", () => {
    const inventario = REQUISITOS_AMULETO.flatMap((r) => Array(r.quantidade).fill(r.nome));
    const jogador = { inventario, amuletoEquipado: false };
    craftarAmuleto(jogador);
    for (const req of REQUISITOS_AMULETO) {
      expect(contarItem(jogador.inventario, req.nome)).toBe(0);
    }
  });
});

describe("alternarAmuleto", () => {
  it("ao equipar, soma +5% ATK e +10% HP, e cura para o novo hpMax", () => {
    const jogador = { ataque: 20, hp: 80, hpMax: 100, amuletoEquipado: false };
    alternarAmuleto(jogador);
    expect(jogador.amuletoEquipado).toBe(true);
    expect(jogador.ataque).toBe(21); // floor(20*1.05)
    expect(jogador.hpMax).toBe(110); // floor(100*1.10)
    expect(jogador.hp).toBe(110);
  });

  it("ao desequipar, reverte para os valores originais salvos", () => {
    const jogador = { ataque: 20, hp: 80, hpMax: 100, amuletoEquipado: false };
    alternarAmuleto(jogador);
    alternarAmuleto(jogador);
    expect(jogador.amuletoEquipado).toBe(false);
    expect(jogador.ataque).toBe(20);
    expect(jogador.hpMax).toBe(100);
  });
});

describe("PRECO_TALISMA e craft", () => {
  it("define o preço fiel ao console", () => {
    expect(PRECO_TALISMA).toEqual({ fragmentos: 10, ouro: 2000 });
  });

  it("podeCraftarTalisma exige 10 Fragmento Antigo e 2000 ouro", () => {
    const semRecursos = { inventario: [], ouro: 0 };
    expect(podeCraftarTalisma(semRecursos)).toBe(false);

    const comRecursos = { inventario: Array(10).fill("Fragmento Antigo"), ouro: 2000 };
    expect(podeCraftarTalisma(comRecursos)).toBe(true);
  });

  it("craftarTalisma consome os fragmentos e o ouro, adiciona o item ao inventário", () => {
    const jogador = { inventario: Array(10).fill("Fragmento Antigo"), ouro: 2000 };
    craftarTalisma(jogador);
    expect(contarItem(jogador.inventario, "Fragmento Antigo")).toBe(0);
    expect(jogador.ouro).toBe(0);
    expect(contarItem(jogador.inventario, "Talismã da Torre")).toBe(1);
  });
});
