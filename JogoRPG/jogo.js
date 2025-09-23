import { criarPersonagem } from "./personagem/criacao/criacaoPersonagem.js";
import { exibirStatusInicial } from "./abertura/cabecario.js";
import { verificarFimDeJogo } from "./verificar/derrota/derrota.js";
import { processarTurno } from "./verificar/turno/turno.js";

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
  let jogoAtivo = true;

  while (jogoAtivo) {
    verificarFimDeJogo(jogador);
    const continuarJogo = processarTurno(jogador);
    if (continuarJogo === false) jogoAtivo = false;
  }
}

// Inicia o jogo
iniciarJogo(jogador);
