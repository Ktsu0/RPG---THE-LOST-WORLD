import { rand } from "@engine/combate/aleatorio.js";

export const TOTAL_ONDAS = 10;

export function criarEstadoOndas(jogador) {
  return { jogador, onda: 1, fragmentosGanhos: 0 };
}

export function avancarOnda(estado) {
  const { jogador } = estado;
  const fragmentoGanho = rand(1, 100) <= 5;
  const fragmentosGanhos = estado.fragmentosGanhos + (fragmentoGanho ? 1 : 0);

  jogador.hp = Math.min(jogador.hpMax, Math.floor(jogador.hp + jogador.hpMax * 0.1));

  const sequenciaCompleta = estado.onda >= TOTAL_ONDAS;
  const novoEstado = { jogador, onda: estado.onda + 1, fragmentosGanhos };

  return { estado: novoEstado, ondaVencida: true, fragmentoGanho, sequenciaCompleta };
}
