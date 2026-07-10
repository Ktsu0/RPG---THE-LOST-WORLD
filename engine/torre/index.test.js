import { describe, it, expect, vi, afterEach } from "vitest";
import { criarEstadoTorre, avancarAndar, executarTurnoTorre } from "./index.js";

afterEach(() => {
  vi.restoreAllMocks();
});

function jogadorBase() {
  return {
    nivel: 3, ataque: 15, defesa: 10, hp: 200, hpMax: 200,
    equipamentos: {}, bonusAtk: 0, bonusDef: 0, amuletoEquipado: false, armaEquipada: null,
    bonusClasse: {}, bonusRaca: {}, bonusCritico: 0, classe: "Guerreiro", xp: 0, ouro: 0,
  };
}

describe("criarEstadoTorre e avancarAndar", () => {
  it("cria o primeiro boss ao avançar do andar 0", () => {
    const estado = criarEstadoTorre(jogadorBase());
    const resultado = avancarAndar(estado);
    expect(resultado.estado.andar).toBe(1);
    expect(resultado.boss.nome).toBe("Guardião de Pedra");
  });
});

describe("executarTurnoTorre", () => {
  it("processa um turno normal: jogador ataca, boss revida", () => {
    let estado = criarEstadoTorre(jogadorBase());
    const { estado: comBoss } = avancarAndar(estado);
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const resultado = executarTurnoTorre(comBoss, "atacar");

    expect(resultado.fim).toBeNull();
    expect(resultado.eventos.some((e) => e.tipo === "dano" && e.autor === "jogador")).toBe(true);
  });

  it("vencer o boss cura 35% do HP máximo e credita xp/ouro do boss", () => {
    let { estado } = avancarAndar(criarEstadoTorre(jogadorBase()));
    estado.bossAtual.hp = 1;
    // 1ª chamada de rand: rand(0,4) do dano do jogador. 2ª chamada: rand(1,100) da checagem de
    // blockChance (25 no Guardião de Pedra) — precisa ficar ACIMA de 25 para o bloqueio não
    // disparar e o dano realmente abater o boss.hp=1.
    vi.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValueOnce(0.5);

    const resultado = executarTurnoTorre(estado, "atacar");

    expect(resultado.fim).toBe("venceu_andar");
    expect(resultado.estado.jogador.hp).toBe(estado.jogador.hpMax); // curou 35%, já estava no máximo então mantém o teto
    expect(resultado.estado.jogador.xp).toBe(70); // xpBase do Guardião de Pedra
    expect(resultado.estado.jogador.ouro).toBe(50);
  });

  it("fuga bem-sucedida (60% de chance) encerra sem punição", () => {
    let { estado } = avancarAndar(criarEstadoTorre(jogadorBase()));
    vi.spyOn(Math, "random").mockReturnValue(0.5); // rand(1,100)=51 <=60 sucesso

    const resultado = executarTurnoTorre(estado, "fugir");

    expect(resultado.fim).toBe("fuga");
  });

  it("declara derrota quando o HP do jogador chega a 0", () => {
    let { estado } = avancarAndar(criarEstadoTorre(jogadorBase()));
    estado.jogador.hp = 1;
    vi.spyOn(Math, "random").mockReturnValue(0.9); // garante que o boss acerta um golpe

    const resultado = executarTurnoTorre(estado, "atacar");

    expect(resultado.fim).toBe("derrota");
  });
});
