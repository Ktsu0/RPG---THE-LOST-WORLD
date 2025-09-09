import { batalha } from "./../../batalha/batalha.js";
import { colors } from "./../../utilitarios.js";

export function interagirComSala(jogador) {
  const { x, y } = jogador.posicao;
  const sala = jogador.masmorraAtual.grid[y][x];

  switch (sala.roomType) {
    // Correção no case "monstro"
    case "monstro":
      console.log(
        `\n${colors.red}⚔ Você se depara com um monstro! Prepare-se para a batalha!${colors.reset}`
      );
      // Altere a ordem dos parâmetros aqui
      batalhar(sala.content.mobs[0], jogador);
      break;

    // Correção no case "miniboss"
    case "miniboss":
      console.log(
        `\n${colors.red}💀 Você se depara com o mini-chefe: ${sala.content.nome}!${colors.reset}`
      );
      // Altere a ordem dos parâmetros aqui
      batalhar(sala.content, jogador);
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
      // NOVO: Adicione "masmorra" como o local da batalha
      batalha(jogador, sala.content, "boss", "masmorra");
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
