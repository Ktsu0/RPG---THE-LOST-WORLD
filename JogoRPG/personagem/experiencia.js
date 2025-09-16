import { colors } from "./../utilitarios.js";
// --- Progressão de nível ---
export function xpParaProximoNivel(jogador) {
  return Math.floor(50 * Math.pow(jogador.nivel, 1.4));
}

export function checarLevelUp(jogador) {
  while (jogador.xp >= xpParaProximoNivel(jogador)) {
    jogador.xp -= xpParaProximoNivel(jogador);
    jogador.nivel += 1;
    jogador.hpMax += 15;
    jogador.ataque += 2;
    jogador.defesa += 1;
    jogador.hp = jogador.hpMax;
    console.log(
      `\n🎉 ${colors.bright}${colors.yellow}Parabéns!${colors.reset} Você subiu para o nível ${colors.cyan}${jogador.nivel}${colors.reset}! HP restaurado para ${colors.green}${jogador.hpMax}${colors.reset}.\n`
    );
  }
}
