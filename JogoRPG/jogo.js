import { criarPersonagem } from "./personagem/criacao/criacaoPersonagem.js";
import { colors } from "./utilitarios.js";
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

function iniciarJogo() {
  exibirStatusInicial(jogador);
  let jogoAtivo = true;

  while (jogoAtivo) {
    if (verificarFimDeJogo(jogador)) break;
    const continuarJogo = processarTurno(jogador);
    if (continuarJogo === false) jogoAtivo = false;
  }
  console.log(
    `\n${colors.bright}${colors.white}--- JOGO ENCERRADO ---${colors.reset}`
  );
}

// Inicia o jogo
iniciarJogo(jogador);
