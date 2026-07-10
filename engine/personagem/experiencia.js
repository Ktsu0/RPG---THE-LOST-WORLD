const LEVELING_CONFIG = {
  baseXp: 50,
  exponent: 1.4,
  statsGain: { hp: 15, atk: 2, def: 1 },
};

export function xpParaProximoNivel(jogador) {
  return Math.floor(LEVELING_CONFIG.baseXp * Math.pow(jogador.nivel, LEVELING_CONFIG.exponent));
}

export function checarLevelUp(jogador) {
  const eventos = [];
  while (jogador.xp >= xpParaProximoNivel(jogador)) {
    jogador.xp -= xpParaProximoNivel(jogador);
    jogador.nivel += 1;
    jogador.hpMax += LEVELING_CONFIG.statsGain.hp;
    jogador.ataque += LEVELING_CONFIG.statsGain.atk;
    jogador.defesa += LEVELING_CONFIG.statsGain.def;
    jogador.hp = jogador.hpMax;
    eventos.push({ tipo: "level_up", nivel: jogador.nivel, hpMax: jogador.hpMax });
  }
  return eventos;
}
