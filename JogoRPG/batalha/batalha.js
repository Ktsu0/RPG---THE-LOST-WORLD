import { colors } from "./../utilitarios.js";
import { aplicarStatusPorTurno } from "../itens/equipamentos/efeitos/armasEfeitos.js";
import { verificarFimDeJogo } from "./../verificar/derrota/derrota.js";
import { finalizarVitoria } from "./../verificar/vitoria/vitoria.js";
import { ataqueJogador } from "./ataqueJogador/ataqueJogador.js";
import { ataqueInimigo } from "./ataqueInimigo/ataqueInimigo.js";
import { curarDruida } from "./../personagem/habilidades.js";
import { exibirStatusBatalha } from "./../codigosUniversais.js";
import { ataqueJogadorOndas } from "./ataqueJogador/ataqueOndaJogador.js";

export function batalha(inimigo, jogador, dificuldade, itens) {
  console.log(
    `\n🔥Você encontrou um ${colors.bright}${colors.red}${inimigo.nome}!${colors.reset} (HP: ${colors.red}${inimigo.hp}${colors.reset} , ATK: ${colors.red}${inimigo.atk}${colors.reset})`
  );
  if (!inimigo.status) inimigo.status = [];
  let rodadas = 0;
  let esqueletosInvocados = [];

  while (inimigo.hp > 0 && jogador.hp > 0) {
    rodadas++;
    curarDruida(jogador);
    aplicarStatusPorTurno(jogador, inimigo);

    if (inimigo.hp <= 0)
      return finalizarVitoria(inimigo, jogador, dificuldade, itens);

    exibirStatusBatalha(jogador, inimigo);
    const resultado = ataqueJogador(
      inimigo,
      jogador,
      rodadas,
      esqueletosInvocados
    );
    if (resultado === "fuga") return false;
    if (resultado === "invalido") continue;

    if (inimigo.hp <= 0) return finalizarVitoria(inimigo, jogador);

    ataqueInimigo(inimigo, jogador, esqueletosInvocados);
    verificarFimDeJogo(jogador);
  }

  if (jogador.hp <= 0) console.log("💀 Você foi derrotado!");
  return false;
}

export function batalhaOnda(inimigo, jogador) {
  console.log(
    `\n🔥 ${colors.red}Você encontrou um ${colors.bright}${colors.red}${inimigo.nome}!${colors.reset} (${colors.red}HP:${inimigo.hp}${colors.reset} , ${colors.red}ATK: ${inimigo.atk}${colors.reset})`
  );
  if (!inimigo.status) inimigo.status = [];
  let rodadas = 0;
  let esqueletosInvocados = [];

  while (inimigo.hp > 0 && jogador.hp > 0) {
    rodadas++;
    curarDruida(jogador);
    aplicarStatusPorTurno(jogador, inimigo);

    if (inimigo.hp <= 0) {
      finalizarVitoria(inimigo, jogador);
      return true;
    }

    exibirStatusBatalha(jogador, inimigo);
    const resultado = ataqueJogadorOndas(
      inimigo,
      jogador,
      rodadas,
      esqueletosInvocados
    );
    if (resultado === "invalido") {
      continue;
    }

    if (inimigo.hp <= 0) {
      finalizarVitoria(inimigo, jogador);
      return true;
    }

    ataqueInimigo(inimigo, jogador, esqueletosInvocados);
    verificarFimDeJogo(jogador);
  }

  // Se o loop terminar e o HP do jogador for <= 0
  if (jogador.hp <= 0) {
    console.log("💀 Você foi derrotado!");
    return false;
  }
  // Se por algum motivo o loop terminar e o HP do inimigo não for <= 0 (situação improvável)
  return false;
}
