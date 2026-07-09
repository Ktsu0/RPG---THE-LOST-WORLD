import { rand } from "./aleatorio.js";
import { aplicarEnvenenamento } from "./efeitosDeStatus.js";

export function verificarEsquivaInimigo(inimigo) {
  return inimigo.habilidade === "esquiva" && rand(1, 100) <= 15;
}

export function verificarAtaqueDuplo(inimigo) {
  return inimigo.habilidade === "ataque_duplo" && rand(1, 100) <= 15;
}

export function verificarEnvenenamentoAoAtacar(inimigo, jogador) {
  if (inimigo.habilidade !== "envenenamento" || rand(1, 100) > 20) return false;
  aplicarEnvenenamento(jogador, rand(3, 5), 5);
  return true;
}
