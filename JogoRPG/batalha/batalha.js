import { colors } from "./../utilitarios.js";
import { aplicarStatusPorTurno } from "../itens/equipamentos/efeitos/armasEfeitos.js";
import { verificarFimDeJogo } from "./../verificar/derrota/derrota.js";
import { finalizarVitoria } from "./../verificar/vitoria/vitoria.js";
import { ataqueJogador } from "./ataqueJogador/ataqueJogador.js";
import { ataqueInimigo } from "./ataqueInimigo/ataqueInimigo.js";
import { curarDruida } from "./../personagem/habilidades.js";
import { exibirStatusBatalha } from "./../codigosUniversais.js";

export function batalha(inimigo, jogador) {
  console.log(
    `\n${colors.bright}🔥 Você encontrou um ${inimigo.nome}!${colors.reset} (${colors.red}HP:${colors.reset} ${inimigo.hp}, ${colors.red}ATK:${colors.reset} ${inimigo.atk})`
  );
  if (!inimigo.status) inimigo.status = [];
  let rodadas = 0;
  let esqueletosInvocados = [];

  while (inimigo.hp > 0 && jogador.hp > 0) {
    rodadas++;
    curarDruida(jogador);
    aplicarStatusPorTurno(jogador, inimigo);

    if (inimigo.hp <= 0) return finalizarVitoria(inimigo, jogador);

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
