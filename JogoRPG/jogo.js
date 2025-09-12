import { criarPersonagem } from "./personagem/criacaoPersonagem.js";
import { colors } from "./utilitarios.js";
import { jogadaMasmorra } from "./masmorra/jogadaMasmorra.js";
import { menuPrincipal } from "./menuPrincipal/menuPrincipal.js";
import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });

export const ARMOR_SLOTS = ["head", "chest", "hands", "legs", "feet"];
export let jogador = criarPersonagem();

jogador.equipamentos = jogador.equipamentos || {
    head: null,
    chest: null,
    hands: null,
    legs: null,
    feet: null,
};

function iniciarJogo() {
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

        if (jogador.masmorraAtual) {
            jogadaMasmorra(jogador);
        } else {
            // O loop principal agora depende do retorno de menuPrincipal
            let continuarJogo = menuPrincipal(jogador);
            if (continuarJogo === false) {
                jogoAtivo = false;
            }
        }
    }
    console.log("\n--- JOGO ENCERRADO ---");
}

// Inicia o jogo
iniciarJogo(jogador);