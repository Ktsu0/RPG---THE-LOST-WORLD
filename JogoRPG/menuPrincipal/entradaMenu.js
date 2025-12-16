// entradaMenu.js (Correção rápida)
import { exibirMenuPrincipal } from "./menuPrincipal.js";
import { jogadaMasmorra } from "./../masmorra/jogadaMasmorra.js";
import { colors, rand } from "./../utilitarios.js";
import { criarInimigo } from "./../inimigos/monstros.js";
import { criarMiniBoss } from "./../inimigos/miniBoss.js";
import { fazerMissao } from "./../missao/missoes.js";
import { sistemaBatalha } from "./../batalha/sistemaBatalha.js";
import { entrarNaTorre } from "./../torre/entrarTorre.js";
import { descansar } from "./../personagem/descansar.js";
import { encontrarTesouro } from "./../tesouro/tesouro.js";
import { menuAmuletoTalisma } from "./../itens/amuletoTalisma/menuPrincipal.js";
import { menuConfiguracoes } from "./../configuracao/menuConfig.js";
import { status } from "./../personagem/status.js";
import { abrirLoja } from "./../loja/loja.js";
import {
  DUNGEON_TEMPLATES,
  gerarMasmorra,
  enterDungeon,
} from "./../masmorra/masmorra.js";

let trabalhando = false; // <-- impede reentrância/concorrência

async function lidarComEntrada(jogador) {
  await exibirMenuPrincipal(jogador);

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  // Remove listeners antigos e adiciona o novo
  process.stdin.removeAllListeners("data");

  process.stdin.on("data", async (key) => {
    // Ctrl+C para sair
    if (key === "\u0003") process.exit();

    // Se já estivermos tratando outra tecla, ignora a próxima
    if (trabalhando) return;
    trabalhando = true;

    try {
      const escolha = key.trim();

      switch (escolha) {
        case "1": {
          // Explorar
          const chance = rand(1, 100);

          // Antes de entrar em fluxos que consomem input, remove listeners
          process.stdin.removeAllListeners("data");

          if (chance <= 20) {
            // MASMORRA
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

            // Chama a masmorra (essa função deve controlar seu próprio input)
            jogadaMasmorra(jogador, () => lidarComEntrada(jogador));
            trabalhando = false;
            return; // não continuar no listener atual
          } else if (chance <= 85) {
            // BATALHA
            if (rand(1, 100) <= 20) {
              const miniboss = criarMiniBoss(null, jogador.nivel);
              console.log(
                `\n${colors.red}⚠️ Atenção! Um MINI-BOSS apareceu!${colors.reset}`
              );
              await sistemaBatalha(miniboss, jogador);
            } else {
              let inimigo = criarInimigo(jogador);
              await sistemaBatalha(inimigo, jogador);
            }

            // Ao terminar a batalha, reexibe o menu principal
            return lidarComEntrada(jogador);
          } else {
            // TESOURO
            if (rand(1, 100) <= 80) {
              await encontrarTesouro(jogador);
            } else {
              console.log(
                "Você explorou, mas não encontrou nada interessante."
              );
            }

            return lidarComEntrada(jogador);
          }
        }

        case "2": {
          // Fazer missão
          process.stdin.removeAllListeners("data");
          await fazerMissao(jogador);
          return lidarComEntrada(jogador);
        }

        case "3": {
          process.stdin.removeAllListeners("data");
          await descansar(jogador);
          return lidarComEntrada(jogador);
        }

        case "4": {
          process.stdin.removeAllListeners("data");
          await status(jogador);
          return lidarComEntrada(jogador);
        }

        case "5": {
          process.stdin.removeAllListeners("data");
          await menuAmuletoTalisma(jogador);
          return lidarComEntrada(jogador);
        }

        case "6": {
          process.stdin.removeAllListeners("data");
          await abrirLoja(jogador);
          return lidarComEntrada(jogador);
        }

        case "7": {
          process.stdin.removeAllListeners("data");
          await entrarNaTorre(jogador);
          return lidarComEntrada(jogador);
        }

        case "8": {
          process.stdin.removeAllListeners("data");
          await menuConfiguracoes(jogador);
          return lidarComEntrada(jogador);
        }

        case "0": {
          console.log("Saindo do jogo. Até a próxima!");
          process.exit();
          break;
        }

        default: {
          console.log("Escolha inválida, tente novamente.");
        }
      }

      // Regeneração passiva
      if (jogador.hp > 0 && rand(1, 100) <= 25) {
        const regen = rand(2, 6);
        jogador.hp = Math.min(jogador.hp + regen, jogador.hpMax || jogador.hp);
        console.log(
          `\n💚 Recuperação passiva: +${regen} HP (HP: ${jogador.hp}/${jogador.hpMax})`
        );
      }
    } catch (err) {
      console.error("Erro no tratamento de input:", err);
    } finally {
      // só libera a flag se ainda estivermos com o listener principal ativo.
      // se já chamamos lidarComEntrada(...) dentro do case, esse return já ocorreu
      trabalhando = false;
    }
  });
}

export { lidarComEntrada };
