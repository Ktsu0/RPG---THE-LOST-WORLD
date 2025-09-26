import { batalha } from "./../batalha/batalha.js";
import { criarMiniBoss } from "./../inimigos/miniBoss.js";
import { colors, rand } from "./../utilitarios.js";
import { aplicarPenalidade } from "./penalidade.js";

export async function createMiniBoss(jogador, missao) {
  if (rand(1, 100) <= missao.chanceMiniBoss) {
    const miniboss = criarMiniBoss(missao.tipo, jogador.nivel);
    // --- LÓGICA DA BATALHA DO MINIBOSS ---
    const venceuBatalha = await batalha(miniboss, jogador);

    if (!venceuBatalha) {
      console.log(
        `${colors.red}❌ Você foi derrotado pelo mini-boss!${colors.reset}`
      );
      aplicarPenalidade(missao.falha.tipo, jogador);
      return; // <-- O 'return' aqui é crucial
    }
  }
}
