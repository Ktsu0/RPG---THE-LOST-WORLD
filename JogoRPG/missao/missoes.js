import promptSync from "prompt-sync";
import { colors } from "./../utilitarios.js";
import { getRaridadeCor } from "./../codigosUniversais.js";
import { masmorraExtra } from "./chanceMasmorra.js";
import { filtroMissao } from "./filtroMissao.js";
import { createMiniBoss } from "./chanceMiniBoss.js";
import { resultadoMissao } from "./resultadoMissao.js";
import { batalhaOndas } from "./missaoOndas.js";
import { printCharByChar, gerarHistoria } from "./createHistoria.js";

const prompt = promptSync({ sigint: true });

function waitForEnter() {
    prompt();
}

export async function fazerMissao(jogador) {
    const missao = filtroMissao(jogador);
    if (!missao) {
        return;
    }

    if (missao.tipoBatalha === "ondas") {
        batalhaOndas(jogador);
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
            recompensaTexto += ` + ${corItem}item (${missao.item})${colors.reset} `;
        } else {
            let corItem = getRaridadeCor(missao.item.raridade);
            if (missao.item.raridade.toLowerCase() === "raro") corItem = colors.blue;
            else if (missao.item.raridade.toLowerCase() === "lendario")
                corItem = colors.yellow;

            recompensaTexto += ` + item ${corItem}${missao.item.nome} [${missao.item.raridade}]${colors.reset}`;
        }
    }

    console.log(recompensaTexto + ".");

    const confirmar = prompt(
        `${colors.bright}${colors.white}Deseja tentar a missão? (s/n) ${colors.reset}`
    );
    if (confirmar.toLowerCase() !== "s") {
        console.log(`${colors.red}❌ Missão cancelada.${colors.reset}`);
        return;
    }

    // Limpa o buffer de entrada para evitar conflito
    waitForEnter();

    process.stdout.write("\x1Bc");
    console.log(`\n${colors.bright}Iniciando a missão...${colors.reset}\n`);
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
    prompt(`${colors.dim}Pressione ENTER para continuar...${colors.reset}`);

    console.clear();

    masmorraExtra(jogador, missao);
    createMiniBoss(jogador, missao);
    resultadoMissao(jogador, missao);
}