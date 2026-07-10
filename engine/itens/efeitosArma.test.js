import { describe, it, expect, vi, afterEach } from "vitest";
import {
  aplicarRouboDeVida,
  verificarCriticoArma,
  aplicarAtaqueDuploArma,
  aplicarConfusao,
  aplicarCongelamento,
  aplicarIncendio,
  processarConfusaoDoTurno,
  processarCongelamentoDoTurno,
  processarIncendioDoTurno,
} from "./efeitosArma.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("aplicarRouboDeVida", () => {
  it("cura o jogador em 15% do dano causado, sem passar do hpMax", () => {
    const jogador = {
      armaEquipada: { efeito: { tipo: "roubo_de_vida", percentual: 0.15 } },
      hp: 50, hpMax: 100,
    };
    aplicarRouboDeVida(jogador, 40); // floor(40*0.15) = 6
    expect(jogador.hp).toBe(56);
  });

  it("não cura acima do hpMax", () => {
    const jogador = {
      armaEquipada: { efeito: { tipo: "roubo_de_vida", percentual: 0.15 } },
      hp: 98, hpMax: 100,
    };
    aplicarRouboDeVida(jogador, 40);
    expect(jogador.hp).toBe(100);
  });

  it("não faz nada se a arma não tiver o efeito roubo_de_vida", () => {
    const jogador = { armaEquipada: { efeito: { tipo: "critico", chance: 15 } }, hp: 50, hpMax: 100 };
    aplicarRouboDeVida(jogador, 40);
    expect(jogador.hp).toBe(50);
  });
});

describe("verificarCriticoArma", () => {
  it("retorna true quando a chance da arma acerta", () => {
    const jogador = { armaEquipada: { efeito: { tipo: "critico", chance: 15 } } };
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1 <=15
    expect(verificarCriticoArma(jogador)).toBe(true);
  });

  it("retorna false quando a arma não tem efeito crítico", () => {
    const jogador = { armaEquipada: { efeito: { tipo: "sangramento", chance: 100 } } };
    expect(verificarCriticoArma(jogador)).toBe(false);
  });
});

describe("aplicarAtaqueDuploArma", () => {
  it("causa dano extra igual ao ataque do jogador quando a chance acerta", () => {
    const jogador = { armaEquipada: { efeito: { tipo: "ataque_duplo", chance: 20 } }, ataque: 12 };
    const inimigo = { hp: 30 };
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1 <=20
    const resultado = aplicarAtaqueDuploArma(jogador, inimigo);
    expect(resultado).toEqual({ ativou: true, danoExtra: 12 });
    expect(inimigo.hp).toBe(18);
  });

  it("não ativa quando a chance falha", () => {
    const jogador = { armaEquipada: { efeito: { tipo: "ataque_duplo", chance: 20 } }, ataque: 12 };
    const inimigo = { hp: 30 };
    vi.spyOn(Math, "random").mockReturnValue(0.99); // rand(1,100)=100 >20
    const resultado = aplicarAtaqueDuploArma(jogador, inimigo);
    expect(resultado).toEqual({ ativou: false, danoExtra: 0 });
    expect(inimigo.hp).toBe(30);
  });
});

describe("aplicarConfusao, aplicarCongelamento, aplicarIncendio + processamento por turno", () => {
  it("aplica e processa confusão: inimigo se fere e pula o turno", () => {
    const inimigo = { atk: 10, hp: 30, status: [] };
    aplicarConfusao(inimigo, 1);
    const resultado = processarConfusaoDoTurno(inimigo);
    expect(resultado).toEqual({ puloTurno: true, dano: 5 }); // floor(10*0.5)=5
    expect(inimigo.hp).toBe(25);
    expect(inimigo.status).toEqual([]); // duração 1 -> expira neste turno
  });

  it("aplica e processa congelamento: inimigo pula o turno sem dano", () => {
    const inimigo = { atk: 10, hp: 30, status: [] };
    aplicarCongelamento(inimigo, 1);
    const resultado = processarCongelamentoDoTurno(inimigo);
    expect(resultado).toEqual({ puloTurno: true });
    expect(inimigo.status).toEqual([]);
  });

  it("aplica e processa incêndio: dano por turno como sangramento", () => {
    const inimigo = { hp: 30, status: [] };
    aplicarIncendio(inimigo, 2, 7);
    const resultado = processarIncendioDoTurno(inimigo);
    expect(resultado).toEqual({ dano: 7, curado: false });
    expect(inimigo.hp).toBe(23);
    expect(inimigo.status).toEqual([{ tipo: "incendio", duracao: 1, dano: 7 }]);
  });

  it("retorna null quando não há o status correspondente", () => {
    const inimigo = { atk: 10, hp: 30, status: [] };
    expect(processarConfusaoDoTurno(inimigo)).toBeNull();
    expect(processarCongelamentoDoTurno(inimigo)).toBeNull();
    expect(processarIncendioDoTurno(inimigo)).toBeNull();
  });
});
