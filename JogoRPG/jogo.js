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
import { encontrarTesouro } from "./batalha/tesouro.js";
import {
  DUNGEON_TEMPLATES,
  gerarMasmorra,
  enterDungeon,
} from "./missao/masmorra/masmorra.js";
import promptSync from "prompt-sync";
import { interagirComSala } from "./missao/masmorra/salas.js";

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

    // --- Jogador dentro de masmorra ---
    if (jogador.masmorraAtual) {
      console.log(
        `\n${colors.bright}Você está em uma masmorra! O que deseja fazer?${colors.reset}`
      );
      console.log(
        `🧭 [01] Mover | 🔎 [02] Olhar | 🔍 [03] Investigar | 🚪 [0] Sair`
      );
      const escolhaMasmorra = prompt("Escolha: ");

      switch (escolhaMasmorra) {
        case "1": // mover
          console.log(
            "Para onde? ([01]Norte / [02]Sul / [03]Leste / [04]Oeste)"
          );
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

          const resultado = jogador.masmorraAtual.move(direcaoConvertida);
          console.log(resultado.msg);

          // Chama interação se for batalha, tesouro, trap, etc.
          interagirComSala(jogador);
          break;

        case "2": // olhar
          console.log(jogador.masmorraAtual.look());
          break;

        case "3": // investigar
          const resultadoInvestigacao = jogador.masmorraAtual.investigate();
          console.log(resultadoInvestigacao.msg);
          break;

        case "0": // sair da masmorra
          jogador.masmorraAtual = null;
          console.log("Você saiu da masmorra.");
          break;

        default:
          console.log("Comando inválido. Tente novamente.");
          break;
      }
    } else {
      // --- Menu principal ---
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
          const chance = rand(1, 100);

          if (chance <= 10) {
            // 10% chance de masmorra
            console.log(
              `\n${colors.red}⚠ Durante sua exploração, você encontrou a entrada de uma MASMORRA!${colors.reset}`
            );
            const templateId = rand(0, DUNGEON_TEMPLATES.length - 1);
            const masmorraGerada = gerarMasmorra(jogador, templateId);
            console.log(`Você entra em: ${masmorraGerada.template.nome}`);

            jogador.masmorraAtual = enterDungeon(masmorraGerada, jogador);
            jogador.posicao = { ...jogador.masmorraAtual.state.start };

            // Interage automaticamente com a sala de entrada
            interagirComSala(jogador);
          } else if (chance <= 70) {
            // 60% chance de encontrar inimigo/miniboss fora da masmorra
            if (rand(1, 100) <= 10) {
              const miniboss = criarMiniBoss(null, jogador.nivel);
              console.log(
                `\n${colors.red}⚠️ Atenção! Um MINI-BOSS apareceu!${colors.reset}`
              );
              batalha(jogador, miniboss);
            } else {
              let inimigo = criarInimigo(jogador);
              batalha(jogador, inimigo);
            }
          } else {
            // 30% chance de nada ou tesouro
            if (rand(1, 100) <= 50) {
              encontrarTesouro(jogador);
            } else {
              console.log(
                "Você explorou, mas não encontrou nada interessante."
              );
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
        jogador.hp = Math.min(jogador.hp + regen, jogador.hpMax || jogador.hp);
        console.log(
          `\n💚 Recuperação passiva: +${regen} HP (HP: ${jogador.hp}/${jogador.hpMax})`
        );
      }
    }
  }
  console.log("\n--- JOGO ENCERRADO ---");
}

// Inicia o jogo
iniciarJogo(jogador);
