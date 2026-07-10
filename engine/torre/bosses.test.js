import { describe, it, expect, vi, afterEach } from "vitest";
import { torreBosses, criarBossTorre, NIVEL_CAP_TORRE } from "./bosses.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("torreBosses", () => {
  it("tem os 10 bosses na ordem do console", () => {
    expect(torreBosses).toHaveLength(10);
    expect(torreBosses[0].nome).toBe("Guardião de Pedra");
    expect(torreBosses[9].nome).toBe("Lorde do Caos");
  });

  it("o Senhor dos Mortos tem a habilidade de invocar esqueletos", () => {
    const boss = torreBosses.find((b) => b.nome === "Senhor dos Mortos");
    expect(boss.habilidades).toEqual({ summonSkeletonsEveryTurns: 1, summonedSkeletonHp: 15, summonedSkeletonDmgBase: 5 });
  });
});

describe("criarBossTorre", () => {
  it("escala hp/atk/def com o nível do jogador (abaixo do teto)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5); // rand(-10,10) e rand(0,4)/rand(0,2) no meio da faixa
    const boss = criarBossTorre(0, { nivel: 3 });
    expect(boss.nome).toBe("Guardião de Pedra");
    expect(boss.hpMax).toBe(boss.hp);
    expect(boss.hp).toBeGreaterThan(210); // hpBase + escalonamento positivo
  });

  it("trava o escalonamento no NIVEL_CAP_TORRE mesmo para jogadores de nível muito alto", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const bossNivel5 = criarBossTorre(0, { nivel: NIVEL_CAP_TORRE });
    const bossNivel50 = criarBossTorre(0, { nivel: 50 });
    expect(bossNivel50.hp).toBe(bossNivel5.hp);
    expect(bossNivel50.atk).toBe(bossNivel5.atk);
  });

  it("inicializa o campo estado com os contadores de mecânica", () => {
    const boss = criarBossTorre(0, { nivel: 1 });
    expect(boss.estado).toEqual({
      turnoContador: 0, invisivel: false, petrificadoTurns: 0,
      esqueletosInvocados: [], jaRessuscitou: false,
    });
  });
});
