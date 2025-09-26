import { colors } from "./../utilitarios.js";
import { aplicarStatusPorTurno } from "../itens/equipamentos/efeitos/armasEfeitos.js";
import { verificarFimDeJogo } from "./../verificar/derrota/derrota.js";
import { finalizarVitoria } from "./../verificar/vitoria/vitoria.js";
import { ataqueJogador } from "./ataqueJogador/ataqueJogador.js";
import { ataqueInimigo } from "./ataqueInimigo/ataqueInimigo.js";
import { curarDruida } from "./../personagem/habilidades.js";
import { exibirStatusBatalha } from "./../codigosUniversais.js";
import { ataqueJogadorOndas } from "./ataqueJogador/ataqueOndaJogador.js";

// Função principal de batalha
export async function batalha(inimigo, jogador, dificuldade, itens) {
  console.log(
    `\n🔥Você encontrou um ${colors.bright}${colors.red}${inimigo.nome}!${colors.reset} (HP: ${colors.red}${inimigo.hp}${colors.reset} , ATK: ${colors.red}${inimigo.atk}${colors.reset})`
  );
  if (!inimigo.status) inimigo.status = [];
  let rodadas = 0;
  let esqueletosInvocados = [];

  // O loop continua, mas agora ele é assíncrono.
  // Ele aguarda a entrada do jogador.
  while (inimigo.hp > 0 && jogador.hp > 0) {
    rodadas++;
    curarDruida(jogador);
    aplicarStatusPorTurno(jogador, inimigo);

    if (inimigo.hp <= 0) {
      finalizarVitoria(inimigo, jogador, dificuldade, itens);
      return true;
    }

    exibirStatusBatalha(jogador, inimigo);

    // Exibe as opções de ataque e aguarda a escolha do jogador
    console.log(
      `${colors.red}[1] Atacar${colors.reset}  ${colors.blue}[2] Usar Poção${colors.reset}  ${colors.gray}[3] Fugir${colors.reset}`
    );
    const escolha = await new Promise((resolve) => {
      process.stdin.once("data", (key) => {
        resolve(key.toString().trim());
      });
    });

    const resultado = await ataqueJogador(
      inimigo,
      jogador,
      rodadas,
      esqueletosInvocados,
      escolha
    );

    if (resultado === "fuga") return false;
    if (resultado === "invalido") {
      continue;
    }

    if (inimigo.hp <= 0) {
      finalizarVitoria(inimigo, jogador);
      return true;
    }

    ataqueInimigo(inimigo, jogador, esqueletosInvocados);
    if (verificarFimDeJogo(jogador)) {
      console.log("💀 Você foi derrotado!");
      return false;
    }
  }

  // A batalha termina quando um dos HP chega a 0
  if (jogador.hp <= 0) {
    console.log("💀 Você foi derrotado!");
    return false;
  }

  // Condição para vitória caso o loop termine por outro motivo
  if (inimigo.hp <= 0) {
    finalizarVitoria(inimigo, jogador, dificuldade, itens);
    return true;
  }
}

export async function batalhaOnda(inimigo, jogador) {
  console.log(
    `\n🔥 ${colors.red}Você encontrou um ${colors.bright}${colors.red}${inimigo.nome}!${colors.reset} (${colors.red}HP:${inimigo.hp}${colors.reset} , ${colors.red}ATK: ${inimigo.atk}${colors.reset})`
  );
  if (!inimigo.status) inimigo.status = [];
  let rodadas = 0;
  let esqueletosInvocados = [];

  // O loop continua, mas agora ele é assíncrono
  while (inimigo.hp > 0 && jogador.hp > 0) {
    rodadas++;
    curarDruida(jogador);
    aplicarStatusPorTurno(jogador, inimigo);

    if (inimigo.hp <= 0) {
      finalizarVitoria(inimigo, jogador);
      return true;
    }

    exibirStatusBatalha(jogador, inimigo);

    // Exibe as opções de ataque e aguarda a escolha do jogador
    console.log(
      `${colors.red}[1] Atacar${colors.reset}  ${colors.blue}[2] Usar Poção${colors.reset}  ${colors.gray}[3] Fugir${colors.reset}`
    );
    const escolha = await new Promise((resolve) => {
      process.stdin.once("data", (key) => {
        resolve(key.toString().trim());
      });
    });

    // Chama a função de ataque, passando a escolha como parâmetro
    const resultado = await ataqueJogadorOndas(
      inimigo,
      jogador,
      rodadas,
      esqueletosInvocados,
      escolha
    );

    if (resultado === "invalido") {
      console.log("Opção inválida.");
      continue;
    }

    if (inimigo.hp <= 0) {
      finalizarVitoria(inimigo, jogador);
      return true;
    }

    ataqueInimigo(inimigo, jogador, esqueletosInvocados);
    if (verificarFimDeJogo(jogador)) {
      console.log("💀 Você foi derrotado!");
      return false;
    }
  }

  // Se o loop terminar por causa do HP do jogador
  if (jogador.hp <= 0) {
    console.log("💀 Você foi derrotado!");
    return false;
  }

  // Se por algum motivo o loop terminar e o HP do inimigo não for <= 0
  return false;
}
