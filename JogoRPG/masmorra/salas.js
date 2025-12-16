import { sistemaBatalha } from "./../../batalha/sistemaBatalha.js";
import { colors } from "./../../utilitarios.js";

// Função para gerar número aleatório (caso não tenha global)
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function interagirComSala(jogador, sala) {
  if (!sala || !sala.roomType) {
    return;
  }

  switch (sala.roomType) {
    case "monstro": {
      console.log(
        `\n${colors.red}⚔ Você se depara com um monstro! Prepare-se para a batalha!${colors.reset}`
      );
      const inimigo = sala.content.mobs[rand(0, sala.content.mobs.length - 1)];
      sistemaBatalha(inimigo, jogador);
      // Limpa a sala após a luta
      sala.roomType = "vazio";
      sala.content = null;
      break;
    }
    case "miniboss": {
      console.log(
        `\n${colors.red}💀 Você se depara com o mini-chefe: ${sala.content.nome}!${colors.reset}`
      );
      const inimigo = sala.content;
      sistemaBatalha(inimigo, jogador);
      // Limpa a sala
      sala.roomType = "vazio";
      break;
    }
    case "boss": {
      console.log(
        `\n${colors.red}👹 Você chegou ao fim da masmorra e se depara com o CHEFE: ${sala.content.nome}!${colors.reset}`
      );
      const inimigo = sala.content;
      sistemaBatalha(inimigo, jogador);
      // Limpa a sala
      sala.roomType = "vazio";
      sala.content = null;
      break;
    }
    case "trap": {
      // Dano aplicado IMEDIATAMENTE ao entrar na sala
      console.log(
        `\n${colors.yellow}💥 Você ativou uma armadilha!${colors.reset}`
      );
      jogador.hp -= sala.content.dano;
      console.log(
        `Você recebeu ${colors.red}${sala.content.dano}${colors.reset} de dano!`
      );
      // A armadilha some depois de ser ativada
      sala.roomType = "vazio";
      sala.content = null;
      break;
    }
    case "treasure": {
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
      sala.roomType = "vazio";
      sala.content = null;
      break;
    }
    case "vazio": {
      console.log(`\nEsta sala está vazia.`);
      break;
    }
    case "entrada": {
      console.log(`\nVocê está na entrada da masmorra.`);
      break;
    }
    default: {
      console.log(`\nVocê entrou em uma sala desconhecida.`);
      break;
    }
  }
}
