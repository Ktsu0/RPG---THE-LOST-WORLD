import { executarRodada } from "./turno.js";

export function criarEstadoBatalha(jogador, inimigo) {
  if (!jogador.status) jogador.status = [];
  return {
    jogador,
    inimigo: { ...inimigo, status: inimigo.status ? [...inimigo.status] : [] },
    rodada: 0,
  };
}

export function executarAcaoJogador(estado, acao) {
  return executarRodada(estado, acao);
}
