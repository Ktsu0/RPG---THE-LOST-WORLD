import { colors, rand } from "./../utilitarios.js";
import promptSync from "prompt-sync";
import { usarPocao } from "./../itens/pocaoCura.js";
import { criarMiniBoss } from "./../inimigos/miniBoss.js"; // Se estiver em outro arquivo
import {
  danoDoJogador,
  aplicarFuria,
  calcularDefesaTotal,
} from "./../personagem/status.js"; // Ou o caminho correto
const prompt = promptSync({ sigint: true });

export const torreBosses = [
  {
    nome: "Guardião de Pedra",
    hpBase: 80,
    atkBase: 12,
    defBase: 6,
    xpBase: 50,
    ouroBase: 30,
    habilidades: { blockChance: 20 },
  },
  {
    nome: "Sentinela de Ferro",
    hpBase: 100,
    atkBase: 14,
    defBase: 8,
    xpBase: 70,
    ouroBase: 40,
    habilidades: { defBoostEveryTurns: { every: 2, amount: 4 } },
  },
  {
    nome: "Mago Sombrio",
    hpBase: 120,
    atkBase: 16,
    defBase: 10,
    xpBase: 90,
    ouroBase: 50,
    habilidades: { invisívelChance: 25 },
  },
  {
    nome: "Lobo Alfa",
    hpBase: 140,
    atkBase: 18,
    defBase: 12,
    xpBase: 110,
    ouroBase: 60,
    habilidades: { critChanceBonus: 25 },
  },
  {
    nome: "Cavaleiro Sombrio",
    hpBase: 160,
    atkBase: 20,
    defBase: 14,
    xpBase: 130,
    ouroBase: 70,
    habilidades: { blockChance: 20, critChanceBonus: 15 },
  },
  {
    nome: "Hidra das Sombras",
    hpBase: 180,
    atkBase: 22,
    defBase: 16,
    xpBase: 150,
    ouroBase: 80,
    habilidades: { petrificarChance: 12, petrificarTurns: 2 },
  },
  {
    nome: "Golem Titânico",
    hpBase: 200,
    atkBase: 24,
    defBase: 18,
    xpBase: 170,
    ouroBase: 90,
    habilidades: { defIncreasePerTurn: 2, breakEquipChance: 10 },
  },
  {
    nome: "Senhor dos Mortos",
    hpBase: 220,
    atkBase: 26,
    defBase: 20,
    xpBase: 190,
    ouroBase: 100,
    habilidades: {
      summonSkeletonsEveryTurns: 2,
      summonedSkeletonHp: 12,
      summonedSkeletonDmgBase: 3,
    },
  },
  {
    nome: "Dragão Negro",
    hpBase: 250,
    atkBase: 30,
    defBase: 22,
    xpBase: 220,
    ouroBase: 120,
    habilidades: { highDef: true, dragonBreathChance: 18 },
  },
  {
    nome: "Lorde do Caos",
    hpBase: 300,
    atkBase: 35,
    defBase: 25,
    xpBase: 300,
    ouroBase: 200,
    habilidades: { canSummonMiniBoss: true, onDeathResurrect: true },
  },
];
// aplica checagens ANTES do jogador atacar (block / invisibilidade)
function bossPreAttackChecagens(boss, jogador) {
  // se boss está invisível, jogador tem chance de errar o ataque (tratado no cálculo do dano)
  if (boss.estado.invisivel) {
    console.log(
      `${colors.gray}👻 ${boss.nome} está invisível — seu ataque pode falhar!${colors.reset}`
    );
  }

  // chance de boss bloquear (avalie quando o jogador causar dano; aqui apenas retorna a prob)
  const blockChance = boss.habilidades.blockChance || 0;

  return { blockChance, invisivel: boss.estado.invisivel };
}

// executado no turno do boss (incrementa contador, aplica buffs e habilidades ativas)
function bossExecutarTurno(boss, jogador, criarMiniBossFn) {
  const h = boss.habilidades;
  boss.estado.turnCounter = (boss.estado.turnCounter || 0) + 1;
  const t = boss.estado.turnCounter;

  // 2) def boost a cada N turns
  if (h.defBoostEveryTurns && t % (h.defBoostEveryTurns.every || 2) === 0) {
    boss.def += h.defBoostEveryTurns.amount || 3;
    console.log(
      `${colors.blue}🛡 ${boss.nome} aumenta sua defesa! (+${h.defBoostEveryTurns.amount})${colors.reset}`
    );
  }

  // 7) defesa aumenta a cada turno (incremental)
  if (h.defIncreasePerTurn) {
    boss.def += h.defIncreasePerTurn;
    // opcional: mensagem curta
  }

  // 3) invisibilidade: aplica chance de ficar invisível para o próximo turno
  if (h.invisívelChance && rand(1, 100) <= h.invisívelChance) {
    boss.estado.invisivel = true;
    console.log(
      `${colors.gray}👻 ${boss.nome} desapareceu na névoa! Fica invisível este turno.${colors.reset}`
    );
  } else {
    boss.estado.invisivel = false;
  }

  // 6) petrificar: chance de paralisar jogador
  if (h.petrificarChance && rand(1, 100) <= h.petrificarChance) {
    jogador.petrificadoTurns = Math.max(
      jogador.petrificadoTurns || 0,
      h.petrificarTurns || 2
    );
    console.log(
      `${colors.gray}🪨 ${boss.nome} petrificou você por ${
        h.petrificarTurns || 2
      } turnos!${colors.reset}`
    );
  }

  // 8) invocar esqueletos a cada N turns (ex.: 2)
  if (
    h.summonSkeletonsEveryTurns &&
    t %
      (h.summonSkeletonsEveryTurns === 0 ? 1 : h.summonSkeletonsEveryTurns) ===
      0
  ) {
    // invoca 2 esqueletos
    for (let i = 0; i < 2; i++) {
      const s = {
        hp: h.summonedSkeletonHp || 12,
        dano: h.summonedSkeletonDmgBase || 3,
      };
      boss.estado.summonedSkeletons.push(s);
    }
    console.log(
      `${colors.gray}☠️ ${boss.nome} invocou 2 esqueletos para auxiliar!${colors.reset}`
    );
  }

  // 9) dragon breath: chance de golpe crítico garantido
  if (h.dragonBreathChance && rand(1, 100) <= h.dragonBreathChance) {
    const dmg = calcularSoproDoDragao(boss, jogador); // função abaixo
    console.log(
      `${colors.red}🔥 ${boss.nome} usou SOPRO DO DRAGÃO e causou ${dmg} dano crítico!${colors.reset}`
    );
    aplicarDanoAoJogador(jogador, dmg);
    return;
  }

  // 10) Lorde do Caos: chance de invocar um miniBoss no meio da batalha
  if (h.canSummonMiniBoss && rand(1, 100) <= (h.summonMiniBossChance || 10)) {
    const m = criarMiniBossFn("comum", jogador.nivel); // usa sua função criarMiniBoss
    boss.estado.summonedMiniBoss = m; // armazena para o fluxo de batalha lidar
    console.log(
      `${colors.yellow}⚠️ ${boss.nome} invocou um mini-boss: ${m.nome}!${colors.reset}`
    );
  }

  // 4 & 5 => critChanceBonus e blockChance já serão considerados quando o boss atacar
  // 7) chance de quebrar arma/armadura (aplica durante ataque do boss)
}

function calcularSoproDoDragao(boss, jogador) {
  // sopro faz "100% de dano crítico" (ou seja, aplica atk do boss * 2 ignorando defesa)
  const base = boss.atk || 0;
  // opcional: considerar defesa do jogador
  return Math.max(1, Math.floor(base * 2));
}

function aplicarDanoAoJogador(jogador, dano) {
  // considera defesa simples (você pode usar calcularDefesaTotal(jogador) se existir)
  const def = calcularDefesaTotal(jogador) || 0;
  const danoFinal = Math.max(0, dano - Math.floor(def / 5));
  jogador.hp = Math.max(0, jogador.hp - danoFinal);
}

function bossAtaca(boss, jogador) {
  // chance de crítico do boss
  const crit = boss.habilidades.critChanceBonus || 0;
  let dano = boss.atk + rand(0, 3);
  if (rand(1, 100) <= crit) {
    console.log(
      `${colors.red}💥 ${boss.nome} acertou um CRÍTICO!${colors.reset}`
    );
    dano *= 2;
  }

  // chance de quebrar equipamento (Golem)
  if (
    boss.habilidades.breakEquipChance &&
    rand(1, 100) <= boss.habilidades.breakEquipChance
  ) {
    // escolhe slot aleatório equipado e remove
    const slots = Object.keys(jogador.equipamentos).filter(
      (s) => jogador.equipamentos[s]
    );
    if (slots.length > 0) {
      const s = slots[rand(0, slots.length - 1)];
      const removed = jogador.equipamentos[s];
      jogador.equipamentos[s] = null;
      console.log(
        `${colors.yellow}🔨 ${boss.nome} quebrou sua peça ${removed.nome} do slot ${s}!${colors.reset}`
      );
    }
  }

  aplicarDanoAoJogador(jogador, dano);
  if (dano > 0)
    console.log(
      `${colors.red}${boss.nome} atacou e causou ${dano} de dano.${colors.reset}`
    );
}

function bossOnDeath(boss, jogador) {
  if (!boss.habilidades.onDeathResurrect) return false;

  if (!boss.estado.hasResurrected) {
    console.log(
      `${colors.yellow}Você ganhou a batalha, mas seu coração está tremendo ainda...${colors.reset}`
    );
    const heal = Math.floor(jogador.hpMax * 0.2);
    jogador.hp = Math.min(jogador.hpMax, jogador.hp + heal);
    console.log(
      `${colors.green}💚 Você recupera ${heal} HP (20% do máximo).${colors.reset}`
    );
    boss.hp = Math.max(1, Math.floor(boss.hpMax * 0.5));
    boss.hpMax = boss.hp;
    boss.def = Math.max(0, Math.floor(boss.def / 2));
    boss.atk = Math.floor(boss.atk * 1.2);
    boss.habilidades.summonMiniBossChance =
      (boss.habilidades.summonMiniBossChance || 10) * 1.5;
    boss.estado.hasResurrected = true;

    console.log(
      `${colors.red}⚠️ ${boss.nome} retornou à batalha (meio ferido, furioso)!${colors.reset}`
    );
    return true; // indicamos que boss voltou e a batalha continua
  }

  return false; // já ressuscitado antes, não reaparece
}

export function criarBossTorre(indice, jogador) {
  const base = torreBosses[indice];
  const hp = base.hpBase + Math.floor(jogador.nivel * 5) + rand(-10, 10);
  const atk = base.atkBase + Math.floor(jogador.nivel * 1.5) + rand(0, 3);
  const def = base.defBase + Math.floor(jogador.nivel * 1);
  const xp = Math.floor(hp / 2);
  const ouro = Math.floor(hp / 3);

  return {
    nome: base.nome,
    hp,
    hpMax: hp,
    atk,
    def,
    xp,
    ouro,
    habilidades: base.habilidades || {},
    estado: {
      turnCounter: 0,
      invisivel: false,
      petrificadoTurns: 0,
      summonedSkeletons: [], // array de esqueletos invocados pelo boss
      hasResurrected: false, // para Lorde do Caos
    },
  };
}

export function batalhaBossTorre(boss, jogador) {
  if (!boss.status) boss.status = [];
  if (!boss.estado.summonedSkeletons) boss.estado.summonedSkeletons = [];

  while (boss.hp > 0 && jogador.hp > 0) {
    console.log(
      `\n${colors.green}Seu HP: ${jogador.hp}/${jogador.hpMax}${colors.reset} | ${colors.red}${boss.nome} HP: ${boss.hp}${colors.reset}`
    );

    if (jogador.petrificadoTurns > 0) {
      console.log(
        `${colors.gray}🗿 Você está petrificado por ${jogador.petrificadoTurns} turno(s)!${colors.reset}`
      );
      jogador.petrificadoTurns--;
    } else {
      console.log("[1] Atacar  [2] Usar Poção  [3] Fugir");
      const escolha = prompt("Escolha: ");

      if (escolha === "1") {
        const preAttack = bossPreAttackChecagens(boss, jogador);

        if (preAttack.invisivel && rand(1, 100) <= 25) {
          console.log(
            `${colors.gray}👻 O Mago Sombrio está invisível e você errou o ataque!${colors.reset}`
          );
        } else {
          if (
            preAttack.blockChance > 0 &&
            rand(1, 100) <= preAttack.blockChance
          ) {
            console.log(
              `${colors.blue}🛡️ ${boss.nome} bloqueou seu ataque!${colors.reset}`
            );
          } else {
            let dano = aplicarFuria(jogador, danoDoJogador());
            const critTotal =
              (jogador.bonusClasse.critChance || 0) +
              (jogador.bonusRaca && jogador.bonusRaca.critChance
                ? jogador.bonusRaca.critChance
                : 0) +
              (jogador.bonusCritico || 0);

            if (rand(1, 100) <= critTotal) {
              console.log(
                `${colors.red}💥 Golpe crítico! Dano dobrado!${colors.reset}`
              );
              dano *= 2;
            }
            boss.hp -= dano;
            boss.hp = Math.max(0, boss.hp);
            console.log(
              `${colors.bright}Você causou ${dano} de dano ao ${boss.nome}.${colors.reset}`
            );
          }
        }
      } else if (escolha === "2") {
        usarPocao(jogador);
      } else if (escolha === "3") {
        if (rand(1, 100) <= 60) {
          console.log(`${colors.cyan}🏃 Você conseguiu fugir!${colors.reset}`);
          return false;
        } else {
          console.log(`${colors.red}❌ Falha na fuga!${colors.reset}`);
        }
      } else {
        console.log(`${colors.red}Opção inválida.${colors.reset}`);
      }
    }

    boss.status.forEach((efeito, idx) => {});

    if (boss.hp > 0) {
      const resultadoHabilidade = bossExecutarTurno(
        boss,
        jogador,
        criarMiniBoss
      );

      if (boss.estado.summonedSkeletons.length > 0) {
        boss.estado.summonedSkeletons.forEach((s, idx) => {
          if (s.hp > 0) {
            console.log(
              `${colors.gray}☠️ Esqueleto invocado causa ${s.dano} de dano a você!${colors.reset}`
            );
            aplicarDanoAoJogador(jogador, s.dano);
          }
        });
      }

      if (!resultadoHabilidade) {
        bossAtaca(boss, jogador);
      }
    }

    if (boss.hp <= 0) {
      if (bossOnDeath(boss, jogador)) {
        continue;
      }
      console.log(
        `${colors.green}✅ Você derrotou ${boss.nome}!${colors.reset}`
      );
      return true;
    }

    if (jogador.hp <= 0) {
      console.log(
        `${colors.red}\n💀 Você foi derrotado... Fim de jogo.${colors.reset}`
      );
      return false;
    }
  }

  return true;
}
