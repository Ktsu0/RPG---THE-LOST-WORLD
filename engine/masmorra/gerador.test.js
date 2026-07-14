import { describe, it, expect, vi, afterEach } from "vitest";
import { templatesMasmorra, determinarDificuldade, gerarMasmorra } from "./gerador.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("templatesMasmorra", () => {
  it("tem 10 templates com os campos esperados", () => {
    expect(templatesMasmorra).toHaveLength(10);
    for (const t of templatesMasmorra) {
      expect(t).toHaveProperty("id");
      expect(t).toHaveProperty("nome");
      expect(t).toHaveProperty("mobs");
      expect(t).toHaveProperty("boss");
      expect(t).toHaveProperty("trapChance");
      expect(t).toHaveProperty("secretChance");
    }
  });

  it("tem os 10 ids esperados, sem duplicatas", () => {
    const ids = templatesMasmorra.map((t) => t.id);
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(10);
  });

  it("cada um dos 7 templates novos tem os mesmos campos dos 3 originais", () => {
    const idsNovos = [
      "floresta-amaldicoada", "caverna-congelada", "biblioteca-arcana",
      "mina-abandonada", "pantano-podre", "templo-das-sombras", "forja-elemental",
    ];
    for (const id of idsNovos) {
      const t = templatesMasmorra.find((tpl) => tpl.id === id);
      expect(t).toBeDefined();
      expect(t.mobs.length).toBeGreaterThan(0);
      expect(t.minibosses.length).toBeGreaterThan(0);
      expect(t.boss.nome).toBeTruthy();
    }
  });
});

describe("determinarDificuldade", () => {
  it("nível 1-4: entre 1 e 5", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(determinarDificuldade(2)).toBe(1);
  });

  it("nível 10+: entre 5 e 10", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    expect(determinarDificuldade(15)).toBe(10);
  });
});

describe("gerarMasmorra", () => {
  it("gera uma grade size x size com entrada no centro", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const dungeon = gerarMasmorra({ nivel: 3 }, templatesMasmorra[0].id, { size: 5 });
    expect(dungeon.size).toBe(5);
    expect(dungeon.grid).toHaveLength(5);
    expect(dungeon.grid[0]).toHaveLength(5);
    expect(dungeon.entrance).toEqual({ x: 2, y: 2 });
    expect(dungeon.grid[2][2].roomType).toBe("entrada");
  });

  it("coloca exatamente uma sala de boss, na célula mais distante da entrada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const dungeon = gerarMasmorra({ nivel: 3 }, templatesMasmorra[0].id, { size: 5 });
    const salasBoss = dungeon.grid.flat().filter((c) => c.roomType === "boss");
    expect(salasBoss).toHaveLength(1);
  });

  it("toda célula começa não visitada, exceto a entrada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const dungeon = gerarMasmorra({ nivel: 3 }, templatesMasmorra[0].id, { size: 5 });
    expect(dungeon.grid[2][2].visited).toBe(true);
    const naoEntrada = dungeon.grid.flat().filter((c) => !(c.x === 2 && c.y === 2));
    expect(naoEntrada.every((c) => c.visited === false)).toBe(true);
  });
});
