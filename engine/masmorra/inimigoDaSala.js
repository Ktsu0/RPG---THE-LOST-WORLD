import { determinarDificuldade } from "./gerador.js";

const STATS_BASE_POR_TIPO = {
  monstro: { hp: 22, atk: 7 },
  miniboss: { hp: 45, atk: 12 },
  boss: { hp: 80, atk: 18 },
};

export function criarInimigoDaSala(celula, jogador) {
  const base = STATS_BASE_POR_TIPO[celula.roomType];
  if (!base) {
    throw new Error(`Tipo de sala "${celula.roomType}" não tem um encontro.`);
  }

  const dificuldade = determinarDificuldade(jogador.nivel);
  const poder = celula.content.poder ?? 1;

  return {
    nome: celula.content.nome,
    hp: Math.round(base.hp * dificuldade * poder),
    hpMax: Math.round(base.hp * dificuldade * poder),
    atk: Math.round(base.atk * dificuldade * poder),
    defesa: Math.round(3 * dificuldade),
    xp: Math.round(15 * dificuldade * poder),
    ouro: Math.round(10 * dificuldade * poder),
    habilidade: null,
    status: [],
  };
}
