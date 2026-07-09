import { describe, it, expect, vi, afterEach } from "vitest";
import { criarEstadoBatalha, executarAcaoJogador } from "./index.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("criarEstadoBatalha", () => {
  it("inicializa o status do jogador e do inimigo como arrays vazios quando ausentes", () => {
    const jogador = { hp: 100 };
    const inimigo = { hp: 30 };
    const estado = criarEstadoBatalha(jogador, inimigo);
    expect(estado.jogador.status).toEqual([]);
    expect(estado.inimigo.status).toEqual([]);
    expect(estado.rodada).toBe(0);
  });

  it("não compartilha a referência do array de status do inimigo com o objeto original", () => {
    const inimigoOriginal = { hp: 30, status: [] };
    const estado = criarEstadoBatalha({ hp: 100 }, inimigoOriginal);
    estado.inimigo.status.push({ tipo: "sangramento", duracao: 1, dano: 1 });
    expect(inimigoOriginal.status).toEqual([]);
  });
});

describe("executarAcaoJogador", () => {
  it("delega para a execução de uma rodada e retorna eventos", () => {
    const jogador = {
      nivel: 0,
      ataque: 10,
      defesa: 5,
      hp: 100,
      hpMax: 100,
      equipamentos: {},
      bonusAtk: 0,
      bonusDef: 0,
      amuletoEquipado: false,
      armaEquipada: null,
      bonusClasse: {},
      bonusRaca: {},
      bonusCritico: 0,
      bonusEsquiva: 0,
      bonusBloqueio: 0,
      classe: "Guerreiro",
      xp: 0,
      ouro: 0,
    };
    const inimigo = {
      nome: "Orc",
      atk: 8,
      defesa: 3,
      hp: 30,
      hpMax: 30,
      xp: 15,
      ouro: 20,
      habilidade: null,
    };
    const estado = criarEstadoBatalha(jogador, inimigo);
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarAcaoJogador(estado, "atacar");

    expect(resultado.fim).toBeNull();
    expect(resultado.eventos.length).toBeGreaterThan(0);
    expect(resultado.estado.inimigo.hp).toBeLessThan(30);
  });
});
