import { rand } from "./aleatorio.js";

export function concederRecompensaVitoria(jogador, inimigo) {
  const xpGanho =
    Number(inimigo.xp) || Math.floor(inimigo.hpMax / 5 + inimigo.atk * 2);
  const ouroGanho = Number(inimigo.ouro) || rand(50, 100);
  jogador.xp += xpGanho;
  jogador.ouro += ouroGanho;
  return { xpGanho, ouroGanho };
}
