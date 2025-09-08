import { criarPersonagem } from "./personagem/criacaoPersonagem.js";
import { status } from "./personagem/status.js";
import { menuAmuletoTalisma } from "./itens/amuleto.js";
import { abrirLoja } from "./itens/loja/itensLoja.js";
import { criarInimigo } from "./inimigos/monstros.js";
import { criarMiniBoss } from "./inimigos/miniBoss.js";
import { colors, rand } from "./utilitarios.js";
import { fazerMissao } from "./missao/missoes.js";
import { batalha } from "./batalha/batalha.js";
import { entrarNaTorre } from "./torre/entrarTorre.js";
import { descansar } from "./personagem/descansar.js";
import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });

// --- Inicialização ---
export const ARMOR_SLOTS = ["head", "chest", "hands", "legs", "feet"];
export let jogador = criarPersonagem();

// Inicializa equipamentos caso ainda não exista
jogador.equipamentos = jogador.equipamentos || {
  head: null,
  chest: null,
  hands: null,
  legs: null,
  feet: null,
};

// --- Jogo principal ---
function iniciarJogo(jogador) {
  console.clear();
  console.log("=== RPG - THE LOST WORLD ===");
  console.log(
    `\nBem-vindo, ${jogador.nome}! Sua missão: ficar forte e salvar a princesa da Torre.\n`
  );
  console.log(
    `\n${colors.bright}${colors.green}Personagem criado:${colors.reset} ${colors.yellow}${jogador.nome}${colors.reset} | ${colors.magenta}${jogador.raca} ${jogador.classe}${colors.reset}`
  );
  console.log(
    `${colors.green}HP:${colors.reset} ${jogador.hp} | ${colors.green}ATK:${colors.reset} ${jogador.ataque} | ${colors.green}DEF:${colors.reset} ${jogador.defesa}`
  );
  let jogoAtivo = true;

  while (jogoAtivo) {
    if (jogador.hp <= 0) {
      console.log("\n💀 Você está inconsciente. Fim de jogo.");
      break;
    }

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
      case "1":
        if (rand(1, 100) <= 90) {
          if (rand(1, 100) <= 10) {
            const miniboss = criarMiniBoss(null, jogador.nivel);
            console.log(
              `\n${colors.red}⚠️ Atenção! Um MINI-BOSS apareceu!${colors.reset}`
            );
            batalha(miniboss, jogador);
          } else {
            let inimigo = criarInimigo(jogador);
            batalha(inimigo, jogador);
          }
        } else {
          if (rand(1, 100) <= 40) {
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
        jogoAtivo = false;
        break;

      default:
        console.log("Escolha inválida, tente novamente.");
        break;
    }

    // Recuperação passiva
    if (jogador.hp > 0 && rand(1, 100) <= 25) {
      const regen = rand(2, 6);
      jogador.hp = Math.min(jogador.hp + regen, jogador.hpMax);
      console.log(
        `\n💚 Recuperação passiva: +${regen} HP (HP: ${jogador.hp}/${jogador.hpMax})`
      );
    }
  }

  console.log("\n--- JOGO ENCERRADO ---");
}
// Inicia o jogo
iniciarJogo(jogador);
