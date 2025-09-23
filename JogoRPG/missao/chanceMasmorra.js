import {
  enterDungeon,
  gerarMasmorra,
  DUNGEON_TEMPLATES,
} from "./../masmorra/masmorra.js";
import { jogadaMasmorra } from "./../masmorra/jogadaMasmorra.js";
import { colors, rand } from "./../utilitarios.js";

export function masmorraExtra(jogador, missao) {
  // 🔥 1% de chance de masmorra secreta
  if (rand(1, 100) <= missao.chanceMasmorra) {
    console.log(
      `${colors.magenta}${colors.bright}⚠ Você encontrou uma MASMORRA SECRETA! Prepare-se para um desafio insano!${colors.reset}`
    );

    // 1. Escolhe um template de masmorra aleatório
    const templateId = rand(0, DUNGEON_TEMPLATES.length - 1);

    // 2. Gera a masmorra
    const masmorraGerada = gerarMasmorra(jogador, templateId);
    console.log(
      `${colors.cyan}🏰 Você entrou em: ${colors.yellow}${masmorraGerada.template.nome}${colors.reset}`
    );

    // 3. Inicia a sessão de exploração
    // Este objeto precisa ser armazenado em um estado global do jogador ou do jogo
    jogador.masmorraAtual = enterDungeon(masmorraGerada, jogador);
    jogadaMasmorra(jogador);
    return;
  }
}
