import { colors, rand } from "./../utilitarios.js";
import { status } from "./../personagem/status.js";
import { abrirLoja } from "./../loja/loja.js";
import { criarInimigo } from "./../inimigos/monstros.js";
import { criarMiniBoss } from "./../inimigos/miniBoss.js";
import { fazerMissao } from "./../missao/missoes.js";
import { batalha } from "./../batalha/batalha.js";
import { entrarNaTorre } from "./../torre/entrarTorre.js";
import { descansar } from "./../personagem/descansar.js";
import { encontrarTesouro } from "./../tesouro/tesouro.js";
import { jogadaMasmorra } from "./../masmorra/jogadaMasmorra.js";
import { menuAmuletoTalisma } from "./../itens/amuletoTalisma/menuPrincipal.js";
import { menuConfiguracoes } from "./../codigosUniversais.js";
import {
  DUNGEON_TEMPLATES,
  gerarMasmorra,
  enterDungeon,
} from "./../masmorra/masmorra.js";
import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });

export async function menuPrincipal(jogador) {
  // Inicialize a propriedade se ela não existir
  if (jogador.ativarHistoria === undefined) {
    jogador.ativarHistoria = true;
  }

  console.log(`\n${colors.bright}O que deseja fazer agora?${colors.reset}`);
  console.log(`🌳 [1] Explorar`);
  console.log(`📝 [2] Fazer uma missão`);
  console.log(`🛌 [3] Descansar`);
  console.log(`📊 [4] Status / Inventário`);
  console.log(`🔮 [5] Craftar`);
  console.log(`💰 [6] Loja`);
  console.log(`🏰 [7] Enfrentar Torre`);
  console.log(`⚙️  [8] Configurações`);
  console.log(`${colors.reset}🚪 [0] Sair do jogo${colors.reset}`);

  const escolha = prompt("Escolha: ");

  switch (escolha) {
    case "1": // explorar
      const chance = rand(1, 100);

      if (chance <= 10) {
        console.log(
          `\n${colors.red}⚠ Durante sua exploração, você encontrou a entrada de uma MASMORRA!${colors.reset}`
        );
        const templateId = rand(0, DUNGEON_TEMPLATES.length - 1);

        const masmorraGerada = gerarMasmorra(jogador, templateId);
        jogador.masmorraAtual = enterDungeon(masmorraGerada, jogador);

        const secretMessages = [
          "O chefe esconde um tesouro unico...",
          "Runas antigas falam do guardião que quebra o ciclo final.",
          "A chama da Fênix arde nas profundezas da masmorra.",
          "Somente o guardião da masmorra pode conceder uma segunda chance.",
          "O tesouro final é a única forma de enganar a morte.",
          "O chefe não teme a morte, pois possui o segredo da vida.",
        ];
        const mensagemSecreta =
          secretMessages[rand(0, secretMessages.length - 1)];
        console.log(
          `${colors.white}Você entra em: ${jogador.masmorraAtual.state.dungeon.template.nome}\n\n${colors.cyan}${mensagemSecreta}${colors.reset}`
        );

        await jogadaMasmorra(jogador);
      } else if (chance <= 85) {
        if (rand(1, 100) <= 10) {
          const miniboss = criarMiniBoss(null, jogador.nivel);
          console.log(
            `\n${colors.red}⚠️ Atenção! Um MINI-BOSS apareceu!${colors.reset}`
          );
          await batalha(miniboss, jogador);
        } else {
          let inimigo = criarInimigo(jogador);
          await batalha(inimigo, jogador);
        }
      } else {
        if (rand(1, 100) <= 80) {
          await encontrarTesouro(jogador);
        } else {
          console.log("Você explorou, mas não encontrou nada interessante.");
        }
      }

      break;

    case "2":
      await fazerMissao(jogador);
      break;

    case "3":
      descansar(jogador);
      break;

    case "4":
      status(jogador);
      break;

    case "5":
      menuAmuletoTalisma(jogador);
      break;

    case "6":
      abrirLoja(jogador);
      break;

    case "7":
      entrarNaTorre(jogador);
      break;
    case "8":
      menuConfiguracoes(jogador);
      break;

    case "0":
      console.log("Saindo do jogo. Até a próxima!");
      return false;

    default:
      console.log("Escolha inválida, tente novamente.");
      break;
  }

  if (jogador.hp > 0 && rand(1, 100) <= 25) {
    const regen = rand(2, 6);
    jogador.hp = Math.min(jogador.hp + regen, jogador.hpMax || jogador.hp);
    console.log(
      `\n💚 Recuperação passiva: +${regen} HP (HP: ${jogador.hp}/${jogador.hpMax})`
    );
  }

  return true;
}
