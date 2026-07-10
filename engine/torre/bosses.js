import { rand } from "@engine/combate/aleatorio.js";

export const NIVEL_CAP_TORRE = 5;

export const torreBosses = [
  { nome: "Guardião de Pedra", hpBase: 210, atkBase: 22, defBase: 14, xpBase: 70, ouroBase: 50, habilidades: { blockChance: 25 } },
  { nome: "Sentinela de Ferro", hpBase: 240, atkBase: 25, defBase: 18, xpBase: 90, ouroBase: 60, habilidades: { defBoostEveryTurns: { every: 2, amount: 6 } } },
  { nome: "Mago Sombrio", hpBase: 270, atkBase: 27, defBase: 16, xpBase: 110, ouroBase: 70, habilidades: { invisívelChance: 30 } },
  { nome: "Lobo Alfa", hpBase: 290, atkBase: 29, defBase: 18, xpBase: 130, ouroBase: 80, habilidades: { critChanceBonus: 30 } },
  { nome: "Cavaleiro Sombrio", hpBase: 320, atkBase: 32, defBase: 21, xpBase: 150, ouroBase: 90, habilidades: { blockChance: 20, critChanceBonus: 15 } },
  { nome: "Hidra das Sombras", hpBase: 340, atkBase: 35, defBase: 22, xpBase: 170, ouroBase: 100, habilidades: { petrificarChance: 15, petrificarTurns: 2 } },
  { nome: "Golem Titânico", hpBase: 370, atkBase: 37, defBase: 26, xpBase: 190, ouroBase: 110, habilidades: { defIncreasePerTurn: 3, breakEquipChance: 8 } },
  { nome: "Senhor dos Mortos", hpBase: 390, atkBase: 39, defBase: 26, xpBase: 210, ouroBase: 120, habilidades: { summonSkeletonsEveryTurns: 1, summonedSkeletonHp: 15, summonedSkeletonDmgBase: 5 } },
  { nome: "Dragão Negro", hpBase: 440, atkBase: 45, defBase: 31, xpBase: 240, ouroBase: 140, habilidades: { highDef: true, dragonBreathChance: 20 } },
  { nome: "Lorde do Caos", hpBase: 490, atkBase: 52, defBase: 36, xpBase: 320, ouroBase: 220, habilidades: { canSummonMiniBoss: true, summonMiniBossChance: 12, onDeathResurrect: true } },
];

export function criarBossTorre(indice, jogador) {
  const base = torreBosses[indice];
  const nivelCalculo = Math.min(jogador.nivel, NIVEL_CAP_TORRE);

  const hp = base.hpBase + Math.floor(nivelCalculo * 7) + rand(-10, 10);
  const atk = base.atkBase + Math.floor(nivelCalculo * 2.2) + rand(0, 4);
  const defesa = base.defBase + Math.floor(nivelCalculo * 1.5) + rand(0, 2);

  return {
    nome: base.nome,
    hp, hpMax: hp,
    atk, defesa,
    xp: base.xpBase, ouro: base.ouroBase,
    habilidades: base.habilidades,
    estado: { turnoContador: 0, invisivel: false, petrificadoTurns: 0, esqueletosInvocados: [], jaRessuscitou: false },
  };
}
