import { rand } from "@engine/combate/aleatorio.js";
import { calcularAtaqueJogador, calcularDefesaJogador } from "@engine/combate/calculoDano.js";
import { criarBossTorre, torreBosses } from "./bosses.js";

export function criarEstadoTorre(jogador) {
  return { jogador, andar: 0, bossAtual: null };
}

export function avancarAndar(estado) {
  const proximoAndar = estado.andar + 1;
  const boss = criarBossTorre(proximoAndar - 1, estado.jogador);
  return { estado: { jogador: estado.jogador, andar: proximoAndar, bossAtual: boss }, boss };
}

function resolverAtaqueJogadorNoBoss(jogador, boss) {
  const danoBase = Math.max(1, calcularAtaqueJogador(jogador) + rand(0, 4) - boss.defesa);
  return danoBase;
}

export function executarTurnoTorre(estado, acao) {
  const { jogador, bossAtual: boss } = estado;
  const eventos = [];

  if (acao === "fugir") {
    const sucesso = rand(1, 100) <= 60;
    eventos.push({ tipo: "fuga", sucesso });
    if (sucesso) {
      return { estado, eventos, fim: "fuga" };
    }
  } else {
    let dano = resolverAtaqueJogadorNoBoss(jogador, boss);
    if (boss.habilidades.blockChance && rand(1, 100) <= boss.habilidades.blockChance) {
      eventos.push({ tipo: "bloqueio", autor: "boss" });
      dano = 0;
    } else {
      boss.hp = Math.max(0, boss.hp - dano);
      eventos.push({ tipo: "dano", autor: "jogador", alvo: "boss", valor: dano });
    }

    if (boss.hp <= 0) {
      eventos.push({ tipo: "morte", alvo: "boss" });
      jogador.hp = Math.min(jogador.hpMax, Math.floor(jogador.hp + jogador.hpMax * 0.35));
      jogador.xp += boss.xp;
      jogador.ouro += boss.ouro;
      const fim = estado.andar >= torreBosses.length ? "torre_completa" : "venceu_andar";
      return { estado: { jogador, andar: estado.andar, bossAtual: null }, eventos, fim };
    }
  }

  // Turno do boss
  boss.estado.turnoContador += 1;

  if (boss.habilidades.defBoostEveryTurns && boss.estado.turnoContador % boss.habilidades.defBoostEveryTurns.every === 0) {
    boss.defesa += boss.habilidades.defBoostEveryTurns.amount;
    eventos.push({ tipo: "boss_buff_defesa", valor: boss.habilidades.defBoostEveryTurns.amount });
  }
  if (boss.habilidades.defIncreasePerTurn) {
    boss.defesa += boss.habilidades.defIncreasePerTurn;
  }

  let chanceCritico = boss.habilidades.critChanceBonus || 0;
  let danoBoss = Math.max(1, boss.atk + rand(0, 4) - Math.floor(calcularDefesaJogador(jogador) / 5));
  const critico = chanceCritico > 0 && rand(1, 100) <= chanceCritico;
  if (critico) danoBoss *= 2;

  if (boss.habilidades.dragonBreathChance && rand(1, 100) <= boss.habilidades.dragonBreathChance) {
    danoBoss = boss.atk * 2;
    eventos.push({ tipo: "sopro_do_dragao" });
  }

  if (boss.habilidades.petrificarChance && rand(1, 100) <= boss.habilidades.petrificarChance) {
    boss.estado.petrificadoJogadorTurns = boss.habilidades.petrificarTurns;
    eventos.push({ tipo: "petrificado", alvo: "jogador" });
  }

  if (boss.habilidades.summonSkeletonsEveryTurns && boss.estado.turnoContador % boss.habilidades.summonSkeletonsEveryTurns === 0) {
    boss.estado.esqueletosInvocados.push({ hp: boss.habilidades.summonedSkeletonHp, atk: boss.habilidades.summonedSkeletonDmgBase });
    eventos.push({ tipo: "miniboss_invocado" });
    danoBoss = Math.floor(danoBoss * 1.3);
  }

  jogador.hp = Math.max(0, jogador.hp - danoBoss);
  eventos.push({ tipo: "dano", autor: "boss", alvo: "jogador", valor: danoBoss, critico });

  if (jogador.hp <= 0) {
    eventos.push({ tipo: "morte", alvo: "jogador" });
    return { estado: { jogador, andar: estado.andar, bossAtual: boss }, eventos, fim: "derrota" };
  }

  return { estado: { jogador, andar: estado.andar, bossAtual: boss }, eventos, fim: null };
}
