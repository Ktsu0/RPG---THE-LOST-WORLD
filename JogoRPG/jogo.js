import { criarPersonagem } from "./personagem/criacao/criacaoPersonagem.js";
import { exibirStatusInicial } from "./abertura/cabecario.js";
import { lidarComEntrada } from "./menuPrincipal/entradaMenu.js";

export const ARMOR_SLOTS = ["head", "chest", "hands", "legs", "feet"];
export let jogador = criarPersonagem();

jogador.equipamentos = jogador.equipamentos || {
  head: null,
  chest: null,
  hands: null,
  legs: null,
  feet: null,
};

async function iniciarJogo() {
  await exibirStatusInicial(jogador);

  // Inicia o jogo no modo de menu
  await lidarComEntrada(jogador);
}

// Inicia o jogo
iniciarJogo(jogador);
