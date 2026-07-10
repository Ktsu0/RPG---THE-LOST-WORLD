import { describe, it, expect, vi, afterEach } from "vitest";
import { executarRodada } from "./turno.js";

afterEach(() => {
  vi.restoreAllMocks();
});

function jogadorBase() {
  return {
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
    status: [],
    xp: 0,
    ouro: 0,
  };
}

function inimigoBase() {
  return {
    nome: "Orc",
    atk: 8,
    defesa: 3,
    hp: 30,
    hpMax: 30,
    xp: 15,
    ouro: 20,
    habilidade: null,
    status: [],
  };
}

describe("executarRodada", () => {
  it("processa uma rodada normal: jogador ataca, inimigo revida, sem eventos especiais", () => {
    const estado = { jogador: jogadorBase(), inimigo: inimigoBase(), rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.fim).toBeNull();
    expect(resultado.estado.rodada).toBe(1);
    expect(resultado.estado.inimigo.hp).toBe(23); // 30 - 7
    expect(resultado.estado.jogador.hp).toBe(93); // 100 - 7
    expect(resultado.eventos).toEqual([
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 7, critico: false },
      { tipo: "dano", autor: "inimigo", alvo: "jogador", valor: 7, critico: false },
    ]);
  });

  it("tiquita o sangramento do inimigo no início da rodada e o remove quando a duração acaba", () => {
    const inimigo = { ...inimigoBase(), status: [{ tipo: "sangramento", duracao: 1, dano: 4 }] };
    const estado = { jogador: jogadorBase(), inimigo, rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.eventos[0]).toEqual({
      tipo: "sangramento_tick",
      alvo: "inimigo",
      dano: 4,
      curado: true,
    });
    expect(resultado.estado.inimigo.status).toEqual([]);
    expect(resultado.estado.inimigo.hp).toBe(19); // 30 - 4 (tick) - 7 (ataque)
    expect(resultado.estado.jogador.hp).toBe(93);
    expect(resultado.fim).toBeNull();
  });

  it("declara derrota quando o envenenamento do jogador zera o HP no início da rodada", () => {
    const jogador = {
      ...jogadorBase(),
      hp: 90,
      status: [{ tipo: "envenenamento", duracao: 1, dano: 95 }],
    };
    const estado = { jogador, inimigo: inimigoBase(), rodada: 0 };

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.eventos).toEqual([
      { tipo: "envenenamento_tick", alvo: "jogador", dano: 95, curado: true },
      { tipo: "morte", alvo: "jogador" },
      { tipo: "derrota" },
    ]);
    expect(resultado.fim).toBe("derrota");
    expect(resultado.estado.jogador.hp).toBe(0);
  });

  it("declara vitória quando o inimigo morre no ataque do jogador", () => {
    const inimigo = { ...inimigoBase(), hp: 5 };
    const estado = { jogador: jogadorBase(), inimigo, rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.eventos).toEqual([
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 7, critico: false },
      { tipo: "morte", alvo: "inimigo" },
      { tipo: "vitoria", xpGanho: 15, ouroGanho: 20 },
    ]);
    expect(resultado.fim).toBe("vitoria");
    expect(resultado.estado.jogador.xp).toBe(15);
    expect(resultado.estado.jogador.ouro).toBe(20);
  });

  it("fuga bem-sucedida encerra a rodada sem ataques", () => {
    const estado = { jogador: jogadorBase(), inimigo: inimigoBase(), rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0.5); // rand(1,100)=51, >40 sucesso

    const resultado = executarRodada(estado, "fugir");

    expect(resultado.eventos).toEqual([{ tipo: "fuga", sucesso: true }]);
    expect(resultado.fim).toBe("fuga");
    expect(resultado.estado.inimigo.hp).toBe(30);
  });

  it("fuga malsucedida permite que o inimigo ataque normalmente", () => {
    const estado = { jogador: jogadorBase(), inimigo: inimigoBase(), rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1, <=40 falha na fuga

    const resultado = executarRodada(estado, "fugir");

    expect(resultado.eventos).toEqual([
      { tipo: "fuga", sucesso: false },
      { tipo: "dano", autor: "inimigo", alvo: "jogador", valor: 7, critico: false },
    ]);
    expect(resultado.fim).toBeNull();
    expect(resultado.estado.jogador.hp).toBe(93);
  });

  it("aplica envenenamento no jogador quando o inimigo tem a habilidade e a chance acerta", () => {
    const inimigo = { ...inimigoBase(), habilidade: "envenenamento" };
    const estado = { jogador: jogadorBase(), inimigo, rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.eventos).toEqual([
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 7, critico: false },
      { tipo: "dano", autor: "inimigo", alvo: "jogador", valor: 7, critico: false },
      { tipo: "envenenamento_aplicado", alvo: "jogador" },
    ]);
    expect(resultado.estado.jogador.status).toEqual([
      { tipo: "envenenamento", duracao: 3, dano: 5 },
    ]);
  });
});

describe("executarRodada com habilidades avançadas de inimigo", () => {
  it("paralisia: jogador perde o turno de ataque quando paralisado no início da rodada", () => {
    const jogador = { ...jogadorBase(), status: [{ tipo: "paralisado", duracao: 1 }] };
    const estado = { jogador, inimigo: inimigoBase(), rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.eventos[0]).toEqual({ tipo: "paralisado", alvo: "jogador" });
    // sem evento de dano do jogador para o inimigo (o ataque foi pulado)
    expect(resultado.eventos.some((e) => e.tipo === "dano" && e.autor === "jogador")).toBe(false);
  });

  it("invulnerável: dano do jogador é ignorado enquanto o status estiver ativo", () => {
    const inimigo = { ...inimigoBase(), status: [{ tipo: "invulneravel", duracao: 1 }] };
    const estado = { jogador: jogadorBase(), inimigo, rodada: 0 };
    const hpAntes = inimigo.hp;
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.eventos.some((e) => e.tipo === "invulneravel_ativo")).toBe(true);
    expect(resultado.estado.inimigo.hp).toBe(hpAntes);
  });

  it("roubo e fuga: inimigo com a habilidade rouba ouro e a batalha termina em fuga", () => {
    const jogador = { ...jogadorBase(), ouro: 100 };
    const inimigo = { ...inimigoBase(), habilidade: "roubo_e_fuga", hp: 30 };
    const estado = { jogador, inimigo, rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.fim).toBe("fuga");
    expect(resultado.eventos.some((e) => e.tipo === "fuga_com_roubo")).toBe(true);
    expect(resultado.estado.jogador.ouro).toBeLessThan(100);
  });

  it("bloquear e contra-atacar: só dispara para inimigos com a habilidade correspondente", () => {
    const inimigo = { ...inimigoBase(), habilidade: "bloquear_e_contra_atacar" };
    const estado = { jogador: jogadorBase(), inimigo, rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.eventos.some((e) => e.tipo === "contra_ataque")).toBe(true);
  });
});
