import { jogadaMasmorra } from "./../../masmorra/jogadaMasmorra.js";
import { menuPrincipal } from "./../../menuPrincipal/menuPrincipal.js";

export function processarTurno(jogador) {
  if (jogador.masmorraAtual) {
    jogadaMasmorra(jogador);
  } else {
    return menuPrincipal(jogador);
  }
}
