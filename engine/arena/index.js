export const NIVEL_MINIMO_ARENA = 5;

export function podeAcessarArena(jogador) {
  return jogador.nivel >= NIVEL_MINIMO_ARENA;
}

export function calcularDificuldadeOnda(onda) {
  return Math.min(10, Math.floor(1 + onda / 3));
}

export function calcularQuantidadeInimigos(onda) {
  if (onda <= 3) return 1;
  if (onda <= 7) return 2;
  if (onda <= 12) return 3;
  return Math.min(5, Math.floor(onda / 4));
}

export function isOndaMiniBoss(onda) {
  return onda % 5 === 0;
}

export function calcularPontos(onda, isMiniBoss) {
  const base = isMiniBoss ? 50 : 10;
  return Math.round(base * (1 + onda * 0.1));
}

export function calcularChanceFragmento(onda, isMiniBoss) {
  if (isMiniBoss) return Math.min(70, 20 + onda * 1.5);
  return Math.min(25, 5 + onda * 0.3);
}

export function criarEstadoArena() {
  return { onda: 1, pontos: 0, fragmentosConfirmados: 0, fragmentosNaoConfirmados: 0, bonusTemporarios: { hpBonus: 0, atkBonus: 0 } };
}

export function confirmarCheckpoint(estadoArena) {
  return {
    ...estadoArena,
    fragmentosConfirmados: estadoArena.fragmentosConfirmados + estadoArena.fragmentosNaoConfirmados,
    fragmentosNaoConfirmados: 0,
  };
}

export function aplicarBencaoVitalidade(jogador, estadoArena) {
  const bonus = Math.floor(jogador.hpMax * 0.15);
  jogador.hpMax += bonus;
  estadoArena.bonusTemporarios.hpBonus += bonus;
}

export function aplicarBencaoPoder(jogador, estadoArena) {
  const bonus = Math.floor(jogador.ataque * 0.1);
  jogador.ataque += bonus;
  estadoArena.bonusTemporarios.atkBonus += bonus;
}

export function removerBonusArena(jogador, estadoArena) {
  jogador.hpMax -= estadoArena.bonusTemporarios.hpBonus;
  jogador.ataque -= estadoArena.bonusTemporarios.atkBonus;
  estadoArena.bonusTemporarios.hpBonus = 0;
  estadoArena.bonusTemporarios.atkBonus = 0;
}
