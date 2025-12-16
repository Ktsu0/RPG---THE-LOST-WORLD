import { rand, colors } from "./../utilitarios.js";
import { sistemaBatalha } from "./../batalha/sistemaBatalha.js";
import { criarInimigo } from "./../inimigos/monstros.js";

// --- Descansar ---
export async function descansar(jogador) {
  // Calcula a cura, sem ultrapassar o HP máximo
  const cura = Math.min(jogador.hpMax - jogador.hp, rand(15, 30));
  jogador.hp += cura;

  console.log(
    `\n🛌 Você descansou e recuperou ${colors.green}${cura} HP${colors.reset}. (HP: ${colors.green}${jogador.hp}${colors.reset}/${colors.green}${jogador.hpMax}${colors.reset})`
  );

  // Chance de encontro durante o descanso
  const encontroChance = 20;
  if (rand(1, 100) <= encontroChance) {
    console.log(
      `${colors.red}⚠ Durante o descanso você foi surpreendido!${colors.reset}`
    );
    const inimigo = criarInimigo(jogador);
    await sistemaBatalha(inimigo, jogador);
  }
}
