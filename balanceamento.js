/**
 * Lida com a vitória sobre o chefe da masmorra.
 * @param {object} jogador O objeto do jogador.
 * @param {object} boss O objeto do chefe derrotado.
 */
function vitoriaBoss(jogador, boss) {
  // Lógica de recompensa do chefe (xp, ouro, drop, etc.)
  finalizarVitoria(jogador, boss);

  // NOVO: Mensagem e opções pós-vitória
  console.log(
    `\n${colors.green}🏆 PARABÉNS! Você conquistou esta masmorra!${colors.reset}`
  );
  console.log(`O que deseja fazer agora?`);
  console.log(`[01] Explorar mais a masmorra.`);
  console.log(`[02] Retornar à superfície.`);

  // Você precisará de uma função para ler a escolha do usuário
  // Exemplo (usando uma função que você já tenha para input):
  // const escolha = lerInput();
  // if (escolha === '1') {
  //   console.log("Você decide continuar explorando a masmorra, que agora está em paz.");
  //   // O jogo continua, e o player pode explorar outras salas vazias
  // } else if (escolha === '2') {
  //   console.log("Você retorna à superfície, vitorioso.");
  //   jogador.masmorraAtual = null; // Remove o estado da masmorra
  //   // Retorna para o menu principal ou loop de jogo
  // }
}

/**
 * Interage com o conteúdo da sala atual do jogador.
 * @param {object} jogador O objeto do jogador.
 */
function interagirComSala(jogador) {
  const { x, y } = jogador.posicao;
  const sala = jogador.masmorraAtual.grid[y][x];

  switch (sala.roomType) {
    case "monstro":
      console.log(
        `\n${colors.red}⚔ Você se depara com um monstro! Prepare-se para a batalha!${colors.reset}`
      );
      // Inicia a batalha
      batalhar(jogador, sala.content.mobs[0]);
      // A função finalizarVitoria já limpará a sala
      break;

    case "miniboss":
      console.log(
        `\n${colors.red}💀 Você se depara com o mini-chefe: ${sala.content.nome}!${colors.reset}`
      );
      // Inicia a batalha contra o mini-chefe
      batalhar(jogador, sala.content);
      // A função finalizarVitoria já limpará a sala
      break;

    case "trap":
      console.log(
        `\n${colors.yellow}💥 Você ativou uma armadilha!${colors.reset}`
      );
      jogador.hp -= sala.content.dano;
      console.log(
        `Você recebeu ${colors.red}${sala.content.dano}${colors.reset} de dano!`
      );

      // Limpa a sala após a interação
      sala.roomType = "vazio";
      sala.content = null;
      break;

    case "treasure":
      if (sala.content.ouro > 0) {
        jogador.ouro += sala.content.ouro;
        console.log(
          `\n${colors.yellow}💰 Você encontrou um baú e pegou ${colors.yellow}${sala.content.ouro}${colors.reset} de ouro!`
        );
      }
      if (sala.content.item) {
        jogador.inventario.push(sala.content.item);
        console.log(
          `Você encontrou e pegou o item: ${colors.magenta}${sala.content.item.nome}${colors.reset}`
        );
      } else {
        console.log(
          `\n${colors.yellow}Você encontrou um baú, mas ele está vazio...${colors.reset}`
        );
      }

      // Limpa a sala após a interação
      sala.roomType = "vazio";
      sala.content = null;
      break;

    case "boss":
      console.log(
        `\n${colors.red}👹 Você chegou ao fim da masmorra e se depara com o CHEFE: ${sala.content.nome}!${colors.reset}`
      );
      batalhar(jogador, sala.content, "boss");
      break;

    case "vazio":
      console.log(`\nEsta sala já foi explorada e está vazia.`);
      break;

    case "entrada":
      console.log(`\nVocê está na entrada da masmorra.`);
      break;

    default:
      console.log(`\nVocê entrou em uma sala desconhecida.`);
      break;
  }
}

// --- LÓGICA DE CONTROLE DO ESTADO DO JOGO ---
if (jogador.masmorraAtual) {
  // O jogador está em uma masmorra
  // Exibe as opções específicas da masmorra
  console.log(
    `\n${colors.bright}Você está em uma masmorra! O que deseja fazer?${colors.reset}`
  );
  console.log(
    `🧭 [01] Mover | 🔎 [02] Olhar | 🔍 [03] Investigar | 🚪 [0] Sair`
  );
  const escolhaMasmorra = prompt("Escolha: ");

  switch (escolhaMasmorra) {
    case "1":
      console.log("Para onde? ([01]Norte / [02]Sul / [03]Leste / [04]Oeste");
      const direcaoEscolhida = prompt(">> ");
      let direcaoConvertida;

      switch (direcaoEscolhida) {
        case "1":
          direcaoConvertida = "norte";
          break;
        case "2":
          direcaoConvertida = "sul";
          break;
        case "3":
          direcaoConvertida = "leste";
          break;
        case "4":
          direcaoConvertida = "oeste";
          break;
        default:
          direcaoConvertida = direcaoEscolhida;
          break;
      }

      // O seu movimento já é lidado aqui
      const resultado = jogador.masmorraAtual.move(direcaoConvertida);
      console.log(resultado.msg);

      // NOVO: A lógica de interação com a sala agora está centralizada!
      interagirComSala(jogador);

      break;
    case "2":
      console.log(jogador.masmorraAtual.look());
      break;
    case "3":
      const resultadoInvestigacao = jogador.masmorraAtual.investigate();
      console.log(resultadoInvestigacao.msg);
      break;
    case "0":
      jogador.masmorraAtual = null; // Remove o estado da masmorra
      console.log("Você saiu da masmorra.");
      break;
    default:
      console.log("Comando inválido. Tente novamente.");
      break;
  }
}
