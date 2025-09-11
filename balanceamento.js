import { rand } from "./utils.js";

// Suponho que você tenha uma forma de obter a confirmação do jogador (sim/não)
// Essa função precisaria ser implementada por você, usando readline ou um método similar.
// Ela retornaria 'true' para sim e 'false' para não.
function obterConfirmacaoDoJogador() {
  // Exemplo de implementação:
  // const resposta = readlineSync.question("Deseja mesmo sair? (s/n) ");
  // return resposta.toLowerCase() === 's';
}

/**
 * Lógica para tentar sair da masmorra, com consequências.
 * @param {object} jogador O objeto do jogador, contendo o estado do jogo.
 * @returns {boolean} Retorna true se o jogador saiu, false se ele permaneceu.
 */
export function tentarSairMasmorra(jogador) {
  const { x, y } = jogador.posicao;
  const { entrance } = jogador.masmorraAtual;

  // Verifica se o jogador está na entrada da masmorra
  if (x === entrance.x && y === entrance.y) {
    jogador.masmorraAtual = null;
    console.log("Você saiu da masmorra.");
    return true; // Saiu sem penalidade
  }

  // Se não estiver na entrada, avisa sobre a consequência
  console.log(
    `\n${colors.yellow}Para sair da masmorra, vá até a entrada. Caso contrário, poderá perder seus itens...${colors.reset}`
  );
  console.log("Deseja realmente abandonar a exploração?");

  // === AQUI VOCÊ DEVE INSERIR A LÓGICA DE CONFIRMAÇÃO DO JOGADOR ===
  // O código abaixo é apenas um exemplo de como funcionaria com uma função de confirmação.
  const confirmouSaida = obterConfirmacaoDoJogador();
  if (!confirmouSaida) {
    console.log("Você decide continuar explorando a masmorra.");
    return false;
  }

  // O jogador confirmou a saída
  console.log("\nVocê se retira da masmorra em um movimento rápido.");

  const bossDerrotado = jogador.masmorraAtual.cleared; // Assumindo que essa flag é atualizada na vitória do boss
  const chanceDePerder = 0.6; // 60% de chance

  // Lógica para perder um item do inventário
  if (Math.random() < chanceDePerder) {
    if (jogador.inventario.length > 0) {
      const indiceItemPerdido = rand(0, jogador.inventario.length - 1);
      const itemPerdido = jogador.inventario.splice(indiceItemPerdido, 1)[0];
      console.log(
        `\n${colors.red}⚠ Você perdeu o item "${itemPerdido.nome}" durante a fuga!${colors.reset}`
      );
    }
  }

  // Mensagem final de fuga
  if (bossDerrotado) {
    console.log("Você saiu da masmorra.");
  } else {
    console.log(
      `Você saiu da masmorra. Os monstros que sobraram lembram de você como um medroso.`
    );
  }

  jogador.masmorraAtual = null;
  return true;
}

// ... dentro do seu loop principal da masmorra ...
// case "0": {
//   // Chama a função que lida com a lógica de saída
//   const saiuComSucesso = tentarSairMasmorra(jogador);
//   // Se a função retornar 'true', encerramos o loop
//   if (saiuComSucesso) {
//     break;
//   }
// }
// ...
