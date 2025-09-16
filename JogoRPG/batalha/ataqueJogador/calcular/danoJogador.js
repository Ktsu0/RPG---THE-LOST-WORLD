import { rand } from "./../../../utilitarios.js";
import { calcularAtaque } from "./calcularAtk.js";

// --- Cálculo de dano ---
export function danoDoJogador(jogador) {
  return Math.max(1, Math.floor(calcularAtaque(jogador)) + rand(0, 4));
}
