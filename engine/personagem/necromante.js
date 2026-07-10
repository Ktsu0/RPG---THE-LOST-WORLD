import { rand } from "@engine/combate/aleatorio.js";

export function deveInvocarEsqueleto(jogador, rodada) {
  return jogador.classe === "Necromante" && rodada % 4 === 0;
}

export function quantidadeDeEsqueletos() {
  const roll = rand(1, 100);
  if (roll <= 95) return 1;
  if (roll <= 98) return 2;
  if (roll <= 99) return 3;
  return 4;
}

export function criarEsqueleto(jogador) {
  return {
    hp: 15 + Math.floor(jogador.nivel * 1.5),
    atk: 5 + Math.floor(jogador.nivel * 0.5),
  };
}

export function ataqueEsqueletos(inimigo, esqueletos) {
  const total = esqueletos.reduce((soma, esq) => soma + esq.atk, 0);
  inimigo.hp = Math.max(0, inimigo.hp - total);
  return total;
}

export function absorverDanoComEsqueletos(esqueletos, dano) {
  if (esqueletos.length === 0) {
    return { esqueletos, danoRestante: dano };
  }
  const [primeiro, ...resto] = esqueletos;
  const novoPrimeiro = { ...primeiro, hp: primeiro.hp - dano };
  const novaFila = novoPrimeiro.hp > 0 ? [novoPrimeiro, ...resto] : resto;
  return { esqueletos: novaFila, danoRestante: 0 };
}
