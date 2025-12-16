import { colors } from "./../utilitarios.js";
import { GAME_CONFIG } from "./../config/game.js";

// --- Progressão de nível ---
export function xpParaProximoNivel(jogador) {
  return Math.floor(GAME_CONFIG.leveling.baseXp * Math.pow(jogador.nivel, GAME_CONFIG.leveling.exponent));
}

export function checarLevelUp(jogador) {
  while (jogador.xp >= xpParaProximoNivel(jogador)) {
    jogador.xp -= xpParaProximoNivel(jogador);
    jogador.nivel += 1;
    jogador.hpMax += GAME_CONFIG.leveling.statsGain.hp;
    jogador.ataque += GAME_CONFIG.leveling.statsGain.atk;
    jogador.defesa += GAME_CONFIG.leveling.statsGain.def;
    jogador.hp = jogador.hpMax;
    console.log(
      `\n🎉 ${colors.bright}${colors.yellow}Parabéns!${colors.reset} Você subiu para o nível ${colors.cyan}${jogador.nivel}${colors.reset}! HP restaurado para ${colors.green}${jogador.hpMax}${colors.reset}.\n`
    );
  }
}
