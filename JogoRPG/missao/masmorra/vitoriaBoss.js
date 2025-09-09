/**
 * Lida com a vitória sobre o chefe da masmorra.
 * @param {object} jogador O objeto do jogador.
 * @param {object} boss O objeto do chefe derrotado.
 */
export function vitoriaBoss(jogador, boss) {
  // Lógica de recompensa do chefe (xp, ouro, drop, etc.)
  // Esta chamada também vai limpar a sala do chefe, já que você a modificou.
  finalizarVitoria(jogador, boss);

  // Mensagem e opções pós-vitória
  console.log(
    `\n${colors.green}🏆 PARABÉNS! Você conquistou esta masmorra!${colors.reset}`
  );

  // Loop para garantir que o jogador faça uma escolha válida
  while (true) {
    console.log(`O que deseja fazer agora?`);
    console.log(`[01] Explorar mais a masmorra.`);
    console.log(`[02] Retornar à superfície.`);

    const escolha = prompt("Escolha: ");

    if (escolha === "1") {
      console.log(
        "\nVocê decide continuar explorando a masmorra, que agora está em paz."
      );
      // A função termina, o jogo continua no loop principal,
      // e o jogador pode explorar as salas agora vazias.
      break;
    } else if (escolha === "2") {
      console.log("\nVocê retorna à superfície, vitorioso.");
      jogador.masmorraAtual = null; // Remove o estado da masmorra
      // O loop principal do jogo detectará que o jogador não está mais na masmorra
      // e o levará para o menu ou para a próxima etapa.
      break;
    } else {
      console.log(
        `${colors.red}Comando inválido. Por favor, escolha 1 ou 2.${colors.reset}`
      );
    }
  }
}
