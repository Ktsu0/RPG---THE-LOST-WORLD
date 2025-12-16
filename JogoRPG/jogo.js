import { criarPersonagem } from "./personagem/criacao/criacaoPersonagem.js";
import { exibirStatusInicial } from "./abertura/cabecario.js";
import { lidarComEntrada } from "./menuPrincipal/entradaMenu.js";
import { verificarSaveExistente, carregarJogo, salvarJogo } from "./sistema/saveSystem.js";
import { lerInput, colors } from "./utilitarios.js";

export const ARMOR_SLOTS = ["head", "chest", "hands", "legs", "feet"];

// Inicializa variável, mas o valor final será definido no iniciarJogo
export let jogador = null; 

async function iniciarJogo() {
  console.clear();
  
  let carregar = false;

  // 1. Verifica Save existente
  if (verificarSaveExistente()) {
    console.log(`\n${colors.cyan}💾 Save encontrado!${colors.reset}`);
    const resposta = await lerInput("Deseja continuar de onde parou? [S/N]: ");
    if (resposta.toLowerCase() === 's' || resposta.toLowerCase() === 'sim') {
      carregar = true;
    }
  }

  // 2. Carrega ou Cria Novo
  if (carregar) {
    jogador = carregarJogo();
    if (!jogador) {
        // Fallback se o save estiver corrompido
        console.log("Criando novo personagem devido a erro no save.");
        jogador = criarPersonagem();
    }
  } else {
    if (verificarSaveExistente()) {
        console.log(`${colors.yellow}⚠️ Iniciando novo jogo. O save antigo será sobrescrito ao salvar.${colors.reset}`);
    }
    jogador = criarPersonagem();
  }

  // Garante integridade do objeto (caso saves antigos não tenham slots novos)
  jogador.equipamentos = jogador.equipamentos || {
    head: null,
    chest: null,
    hands: null,
    legs: null,
    feet: null,
  };

  // 3. Exibe status e vai pro Menu
  await exibirStatusInicial(jogador);
  
  // Salva o estado inicial
  salvarJogo(jogador);

  // Entra no Loop Principal
  await lidarComEntrada(jogador);
}

// Inicia o fluxo
iniciarJogo();
