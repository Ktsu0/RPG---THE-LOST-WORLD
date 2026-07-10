import { describe, it, expect, vi, afterEach } from "vitest";
import {
  verificarEsquivaInimigo,
  verificarAtaqueDuplo,
  verificarEnvenenamentoAoAtacar,
  aplicarInvulneravel, processarInvulneravelDoTurno,
  verificarParalisia, aplicarParalisia, processarParalisiaDoTurno,
  verificarRouboEFuga, roubarOuroEFugir,
  verificarPetrificarAoAtacar, aplicarBuffPetrificar,
  processarRegeneracao,
  verificarBloquearEContraAtacar, calcularContraAtaque,
} from "./habilidadesInimigo.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("verificarEsquivaInimigo", () => {
  it("retorna false quando a habilidade não é esquiva", () => {
    expect(verificarEsquivaInimigo({ habilidade: null })).toBe(false);
  });

  it("retorna true quando a habilidade é esquiva e a chance acerta", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1, <=15 sucesso
    expect(verificarEsquivaInimigo({ habilidade: "esquiva" })).toBe(true);
  });

  it("retorna false quando a habilidade é esquiva mas a chance falha", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99); // rand(1,100)=100, >15 falha
    expect(verificarEsquivaInimigo({ habilidade: "esquiva" })).toBe(false);
  });
});

describe("verificarAtaqueDuplo", () => {
  it("retorna false quando a habilidade não é ataque_duplo", () => {
    expect(verificarAtaqueDuplo({ habilidade: null })).toBe(false);
  });

  it("retorna true quando a habilidade é ataque_duplo e a chance acerta", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(verificarAtaqueDuplo({ habilidade: "ataque_duplo" })).toBe(true);
  });

  it("retorna false quando a habilidade é ataque_duplo mas a chance falha", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(verificarAtaqueDuplo({ habilidade: "ataque_duplo" })).toBe(false);
  });
});

describe("verificarEnvenenamentoAoAtacar", () => {
  it("não aplica veneno se a habilidade do inimigo não for envenenamento", () => {
    const inimigo = { habilidade: null };
    const jogador = { status: [] };
    expect(verificarEnvenenamentoAoAtacar(inimigo, jogador)).toBe(false);
    expect(jogador.status).toHaveLength(0);
  });

  it("aplica veneno no jogador quando a habilidade é envenenamento e a chance acerta", () => {
    const inimigo = { habilidade: "envenenamento" };
    const jogador = { status: [] };
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1<=20 sucesso; rand(3,5)=3
    expect(verificarEnvenenamentoAoAtacar(inimigo, jogador)).toBe(true);
    expect(jogador.status).toEqual([{ tipo: "envenenamento", duracao: 3, dano: 5 }]);
  });

  it("não aplica veneno quando a chance falha", () => {
    const inimigo = { habilidade: "envenenamento" };
    const jogador = { status: [] };
    vi.spyOn(Math, "random").mockReturnValue(0.99); // rand(1,100)=100>20 falha
    expect(verificarEnvenenamentoAoAtacar(inimigo, jogador)).toBe(false);
    expect(jogador.status).toHaveLength(0);
  });
});

describe("invulneravel", () => {
  it("aplica e processa: permanece invulnerável e decrementa duração", () => {
    const inimigo = { status: [] };
    aplicarInvulneravel(inimigo);
    expect(processarInvulneravelDoTurno(inimigo)).toBe(true);
    expect(inimigo.status).toEqual([]); // duração 1 -> já expirou neste processamento
  });

  it("retorna false quando o inimigo não está invulnerável", () => {
    expect(processarInvulneravelDoTurno({ status: [] })).toBe(false);
  });
});

describe("paralisia (teia)", () => {
  it("verificarParalisia: 12% de chance", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1 <=12
    expect(verificarParalisia()).toBe(true);
  });

  it("aplicarParalisia e processarParalisiaDoTurno: jogador perde o turno e a duração decrementa", () => {
    const jogador = { status: [] };
    aplicarParalisia(jogador, 2);
    expect(processarParalisiaDoTurno(jogador)).toBe(true);
    expect(jogador.status).toEqual([{ tipo: "paralisado", duracao: 1 }]);
    expect(processarParalisiaDoTurno(jogador)).toBe(true);
    expect(jogador.status).toEqual([]);
  });

  it("processarParalisiaDoTurno retorna false quando o jogador não está paralisado", () => {
    expect(processarParalisiaDoTurno({ status: [] })).toBe(false);
  });
});

describe("roubo e fuga", () => {
  it("verificarRouboEFuga: 20% de chance", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1 <=20
    expect(verificarRouboEFuga()).toBe(true);
  });

  it("roubarOuroEFugir: rouba entre 20 e 50, capado no ouro disponível", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(20,50)=20
    const jogador = { ouro: 100 };
    expect(roubarOuroEFugir(jogador)).toBe(20);
    expect(jogador.ouro).toBe(80);
  });

  it("roubarOuroEFugir nunca deixa o ouro negativo", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99); // rand(20,50)=50
    const jogador = { ouro: 10 };
    expect(roubarOuroEFugir(jogador)).toBe(10);
    expect(jogador.ouro).toBe(0);
  });
});

describe("petrificar (auto-buff do inimigo)", () => {
  it("verificarPetrificarAoAtacar: 20% de chance", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(verificarPetrificarAoAtacar({ habilidade: "petrificar" })).toBe(true);
  });

  it("verificarPetrificarAoAtacar: false quando a habilidade não é petrificar", () => {
    expect(verificarPetrificarAoAtacar({ habilidade: "regeneracao" })).toBe(false);
  });

  it("aplicarBuffPetrificar aumenta a defesa em floor(defesa*0.05)+1", () => {
    const inimigo = { defesa: 20 };
    aplicarBuffPetrificar(inimigo);
    expect(inimigo.defesa).toBe(22); // floor(20*0.05)+1 = 1+1 = 2 -> 20+2=22
  });
});

describe("regeneracao", () => {
  it("cura floor(hpMax*0.07) quando a habilidade é regeneracao e a chance de 30% acerta", () => {
    const inimigo = { habilidade: "regeneracao", hp: 50, hpMax: 100 };
    vi.spyOn(Math, "random").mockReturnValue(0.2); // < 0.3
    expect(processarRegeneracao(inimigo)).toEqual({ curou: true, valor: 7 });
    expect(inimigo.hp).toBe(57);
  });

  it("não cura quando a habilidade não é regeneracao", () => {
    const inimigo = { habilidade: "petrificar", hp: 50, hpMax: 100 };
    expect(processarRegeneracao(inimigo)).toEqual({ curou: false, valor: 0 });
  });

  it("não cura quando a chance falha", () => {
    const inimigo = { habilidade: "regeneracao", hp: 50, hpMax: 100 };
    vi.spyOn(Math, "random").mockReturnValue(0.9); // >= 0.3
    expect(processarRegeneracao(inimigo)).toEqual({ curou: false, valor: 0 });
  });
});

describe("bloquear e contra-atacar", () => {
  it("verificarBloquearEContraAtacar: 10% de chance", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(verificarBloquearEContraAtacar()).toBe(true);
  });

  it("calcularContraAtaque retorna 90% do dano original", () => {
    expect(calcularContraAtaque(null, 20)).toBe(18);
  });
});
