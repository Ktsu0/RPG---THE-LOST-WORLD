import { colors } from "./../utilitarios.js";
import { getRaridadeCor } from "./../codigosUniversais.js";
import { masmorraExtra } from "./chanceMasmorra.js";
import { filtroMissao } from "./filtroMissao.js";
import { createMiniBoss } from "./chanceMiniBoss.js";
import { resultadoMissao } from "./resultadoMissao.js";
import { batalhaOndas } from "./missaoOndas.js";
import { printCharByChar, gerarHistoria } from "./createHistoria.js";
import { lidarComEntrada } from "../menuPrincipal/entradaMenu.js";

export async function fazerMissao(jogador) {
  // 1. Remove qualquer listener de entrada anterior
  process.stdin.removeAllListeners("data");

  // 2. Encontra a missão e exibe as informações
  const missao = filtroMissao(jogador);
  if (!missao) {
    lidarComEntrada(jogador);
    return;
  }

  if (missao.tipoBatalha === "ondas") {
    await batalhaOndas(jogador); // Usa await para esperar a batalha
    lidarComEntrada(jogador);
    return;
  }

  console.log(
    `\n${colors.yellow}📜 Missão: ${colors.bright}${missao.descricao}${colors.reset}`
  );
  console.log(`${colors.cyan}📖 ${missao.historia}${colors.reset}`);

  let recompensaTexto = `${colors.green}Chance de sucesso:${colors.reset} ${missao.chanceSucesso}% | `;
  recompensaTexto += `${colors.blue}Recompensa:${colors.reset} ${
    colors.green
  }${Math.round(missao.xp(jogador.nivel))} XP${colors.reset} `;
  recompensaTexto += `e ${colors.yellow}${Math.round(
    missao.ouro(jogador.nivel)
  )} ouro${colors.reset}`;

  if (missao.item) {
    if (typeof missao.item === "string") {
      recompensaTexto += ` + item (${missao.item}) `;
    } else {
      let corItem = getRaridadeCor(missao.item.raridade);
      if (missao.item.raridade.toLowerCase() === "raro") corItem = colors.blue;
      else if (missao.item.raridade.toLowerCase() === "lendario")
        corItem = colors.yellow;

      recompensaTexto += ` + item ${corItem}${missao.item.nome} [${missao.item.raridade}]${colors.reset}`;
    }
  }

  console.log(recompensaTexto + ".");

  // 3. Pede confirmação e espera a entrada do usuário de forma assíncrona
  console.log(
    `${colors.bright}${colors.white}Deseja tentar a missão? (s/n) ${colors.reset}`
  );

  // Cria uma nova Promise para esperar a resposta 's' ou 'n'
  const confirmar = await new Promise((resolve) => {
    process.stdin.once("data", (key) => {
      resolve(key.toString().trim().toLowerCase());
    });
  });

  if (confirmar !== "s") {
    console.log(`${colors.red}❌ Missão cancelada.${colors.reset}`);
    lidarComEntrada(jogador); // Volta para o menu
    return;
  }

  console.clear();
  console.log(`\n${colors.bright}Iniciando a missão...${colors.reset}\n`);

  // 4. Lógica de história com await
  if (jogador.ativarHistoria) {
    try {
      const historiaGerada = await gerarHistoria(missao);
      await printCharByChar(historiaGerada, 40);
    } catch (error) {
      console.error(
        `${colors.red}Falha ao gerar a história da missão:`,
        error,
        colors.reset
      );
      console.log("Continuando com a missão sem a história.");
    }

    // Espera por ENTER
    console.log(
      `${colors.dim}Pressione ENTER para continuar...${colors.reset}`
    );
    await new Promise((resolve) => {
      process.stdin.once("data", () => {
        resolve();
      });
    });
    console.clear();
  } else {
    console.log(`${colors.dim}A história foi pulada.${colors.reset}`);
  }

  // 5. Finaliza a missão e volta para o menu
  resultadoMissao(jogador, missao);
  masmorraExtra(jogador, missao);
  createMiniBoss(jogador, missao);
}
