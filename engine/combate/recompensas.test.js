import { describe, it, expect, vi, afterEach } from "vitest";
import { concederRecompensaVitoria } from "./recompensas.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("concederRecompensaVitoria", () => {
  it("usa o XP e o ouro definidos no inimigo quando presentes", () => {
    const jogador = { xp: 0, ouro: 0 };
    const inimigo = { xp: 20, ouro: 30, hpMax: 50, atk: 10 };
    const resultado = concederRecompensaVitoria(jogador, inimigo);
    expect(resultado).toEqual({ xpGanho: 20, ouroGanho: 30 });
    expect(jogador.xp).toBe(20);
    expect(jogador.ouro).toBe(30);
  });

  it("usa a fórmula de fallback quando o inimigo não define xp/ouro", () => {
    const jogador = { xp: 0, ouro: 0 };
    const inimigo = { hpMax: 50, atk: 10 };
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(50,100)=50
    const resultado = concederRecompensaVitoria(jogador, inimigo);
    // xpGanho = floor(50/5 + 10*2) = floor(10+20) = 30
    expect(resultado).toEqual({ xpGanho: 30, ouroGanho: 50 });
    expect(jogador.xp).toBe(30);
    expect(jogador.ouro).toBe(50);
  });
});
