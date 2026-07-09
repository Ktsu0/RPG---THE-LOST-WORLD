import { describe, it, expect, vi, afterEach } from "vitest";
import {
  processarCuraXama,
  aplicarSangramento,
  processarSangramentoDoTurno,
  aplicarEnvenenamento,
  processarEnvenenamentoDoTurno,
  aplicarEfeitoDaArmaAoAcertar,
} from "./efeitosDeStatus.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("processarCuraXama", () => {
  it("retorna null para classes que não são Xamã", () => {
    const jogador = { classe: "Guerreiro", hp: 50, hpMax: 100 };
    expect(processarCuraXama(jogador)).toBeNull();
  });

  it("cura 5% do HP máximo quando a chance de 50% acerta", () => {
    const jogador = { classe: "Xamã", hp: 80, hpMax: 100 };
    vi.spyOn(Math, "random").mockReturnValue(0.4); // < 0.5
    const resultado = processarCuraXama(jogador);
    expect(resultado).toEqual({ curou: true, valor: 5 });
    expect(jogador.hp).toBe(85);
  });

  it("não cura quando a chance falha", () => {
    const jogador = { classe: "Xamã", hp: 80, hpMax: 100 };
    vi.spyOn(Math, "random").mockReturnValue(0.9); // >= 0.5
    expect(processarCuraXama(jogador)).toEqual({ curou: false, valor: 0 });
    expect(jogador.hp).toBe(80);
  });
});

describe("aplicarSangramento e processarSangramentoDoTurno", () => {
  it("retorna null quando o inimigo não tem sangramento ativo", () => {
    const inimigo = { hp: 30, status: [] };
    expect(processarSangramentoDoTurno(inimigo)).toBeNull();
  });

  it("aplica dano por turno e mantém o status quando a duração não acabou", () => {
    const inimigo = { hp: 30, status: [] };
    aplicarSangramento(inimigo, 2, 5);
    const resultado = processarSangramentoDoTurno(inimigo);
    expect(resultado).toEqual({ dano: 5, curado: false });
    expect(inimigo.hp).toBe(25);
    expect(inimigo.status).toEqual([{ tipo: "sangramento", duracao: 1, dano: 5 }]);
  });

  it("remove o status quando a duração termina", () => {
    const inimigo = { hp: 30, status: [] };
    aplicarSangramento(inimigo, 1, 5);
    const resultado = processarSangramentoDoTurno(inimigo);
    expect(resultado).toEqual({ dano: 5, curado: true });
    expect(inimigo.status).toEqual([]);
  });
});

describe("aplicarEnvenenamento e processarEnvenenamentoDoTurno", () => {
  it("retorna null quando o jogador não está envenenado", () => {
    const jogador = { hp: 100, status: [] };
    expect(processarEnvenenamentoDoTurno(jogador)).toBeNull();
  });

  it("aplica dano por turno e mantém o status quando a duração não acabou", () => {
    const jogador = { hp: 100, status: [] };
    aplicarEnvenenamento(jogador, 3, 5);
    const resultado = processarEnvenenamentoDoTurno(jogador);
    expect(resultado).toEqual({ dano: 5, curado: false });
    expect(jogador.hp).toBe(95);
  });

  it("remove o status quando a duração termina", () => {
    const jogador = { hp: 100, status: [] };
    aplicarEnvenenamento(jogador, 1, 5);
    const resultado = processarEnvenenamentoDoTurno(jogador);
    expect(resultado).toEqual({ dano: 5, curado: true });
    expect(jogador.status).toEqual([]);
  });
});

describe("aplicarEfeitoDaArmaAoAcertar", () => {
  it("retorna false quando o jogador não tem arma equipada", () => {
    const jogador = { armaEquipada: null };
    const inimigo = { status: [] };
    expect(aplicarEfeitoDaArmaAoAcertar(jogador, inimigo)).toBe(false);
  });

  it("retorna false quando o efeito da arma não é sangramento", () => {
    const jogador = { armaEquipada: { efeito: { tipo: "critico" } } };
    const inimigo = { status: [] };
    expect(aplicarEfeitoDaArmaAoAcertar(jogador, inimigo)).toBe(false);
  });

  it("aplica sangramento quando a chance da arma acerta", () => {
    const jogador = {
      armaEquipada: {
        nome: "Adaga Sombria",
        efeito: { tipo: "sangramento", chance: 60, duracao: 3, danoPorTurno: 4 },
      },
    };
    const inimigo = { status: [] };
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1, <=60 sucesso
    expect(aplicarEfeitoDaArmaAoAcertar(jogador, inimigo)).toBe(true);
    expect(inimigo.status).toEqual([{ tipo: "sangramento", duracao: 3, dano: 4 }]);
  });

  it("não aplica sangramento quando a chance da arma falha", () => {
    const jogador = {
      armaEquipada: {
        nome: "Adaga Sombria",
        efeito: { tipo: "sangramento", chance: 60, duracao: 3, danoPorTurno: 4 },
      },
    };
    const inimigo = { status: [] };
    vi.spyOn(Math, "random").mockReturnValue(0.99); // rand(1,100)=100, >60 falha
    expect(aplicarEfeitoDaArmaAoAcertar(jogador, inimigo)).toBe(false);
    expect(inimigo.status).toEqual([]);
  });
});
