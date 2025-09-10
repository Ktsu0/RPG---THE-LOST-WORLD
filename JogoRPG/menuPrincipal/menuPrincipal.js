import { colors, rand } from "./../utilitarios.js";
import { status } from "./../personagem/status.js";
import { menuAmuletoTalisma } from "./../itens/amuleto.js";
import { abrirLoja } from "./../itens/loja/itensLoja.js";
import { criarInimigo } from "./../inimigos/monstros.js";
import { criarMiniBoss } from "./../inimigos/miniBoss.js";
import { fazerMissao } from "./../missao/missoes.js";
import { batalha } from "./../batalha/batalha.js";
import { entrarNaTorre } from "./../torre/entrarTorre.js";
import { descansar } from "./../personagem/descansar.js";
import { encontrarTesouro } from "./../batalha/tesouro.js";
import {
  DUNGEON_TEMPLATES,
  gerarMasmorra,
  enterDungeon,
} from "./../missao/masmorra/masmorra.js";
import promptSync from "prompt-sync";
import { jogadaMasmorra } from "./../missao/masmorra/jogadaMasmorra.js";

const prompt = promptSync({ sigint: true });

export function menuPrincipal(jogador) {
  console.log(`\n${colors.bright}O que deseja fazer agora?${colors.reset}`);
  console.log(`🌳 [1] Explorar`);
  console.log(`📝 [2] Fazer uma missão`);
  console.log(`🛌 [3] Descansar`);
  console.log(`📊 [4] Status / Inventário`);
  console.log(`🔮 [5] Craftar`);
  console.log(`💰 [6] Loja`);
  console.log(`🏰 [7] Enfrentar Torre`);
  console.log(`${colors.reset}🚪 [0] Sair do jogo${colors.reset}`);

  const escolha = prompt("Escolha: ");

  switch (escolha) {
    case "1": // explorar
      const chance = rand(1, 10);

      if (chance <= 100) {
        console.log(
          `\n${colors.red}⚠ Durante sua exploração, você encontrou a entrada de uma MASMORRA!${colors.reset}`
        );
        const templateId = rand(0, DUNGEON_TEMPLATES.length - 1);
        const masmorraGerada = gerarMasmorra(jogador, templateId);
        console.log(`Você entra em: ${masmorraGerada.template.nome}`);

        const masmorraAPI = enterDungeon(masmorraGerada, jogador);
        // Atribua a masmorra API ao jogador.
        jogador.masmorraAtual = masmorraAPI;
        // Chame a função para iniciar o loop da masmorra
        jogadaMasmorra(jogador, masmorraAPI);
      } else if (chance <= 85) {
        if (rand(1, 100) <= 10) {
          const miniboss = criarMiniBoss(null, jogador.nivel);
          console.log(
            `\n${colors.red}⚠️ Atenção! Um MINI-BOSS apareceu!${colors.reset}`
          );
          batalha(miniboss, jogador); // Chame a batalha diretamente
        } else {
          let inimigo = criarInimigo(jogador);
          batalha(inimigo, jogador); // Chame a batalha diretamente
        }
      } else {
        if (rand(1, 100) <= 80) {
          encontrarTesouro(jogador);
        } else {
          console.log("Você explorou, mas não encontrou nada interessante.");
        }
      }

      break;

    case "2":
      fazerMissao(jogador);
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

    case "0":
      console.log("Saindo do jogo. Até a próxima!");
      return false; // Retorna false para encerrar o loop principal

    default:
      console.log("Escolha inválida, tente novamente.");
      break;
  }

  // Recuperação passiva
  if (jogador.hp > 0 && rand(1, 100) <= 25) {
    const regen = rand(2, 6);
    jogador.hp = Math.min(jogador.hp + regen, jogador.hpMax || jogador.hp);
    console.log(
      `\n💚 Recuperação passiva: +${regen} HP (HP: ${jogador.hp}/${jogador.hpMax})`
    );
  }

  return true; // Retorna true para continuar o loop
}
