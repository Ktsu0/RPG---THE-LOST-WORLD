import { batalha } from "./../batalha/batalha.js";
import { colors } from "./../utilitarios.js";
import promptSync from "prompt-sync";
import { limparSalaMasmorra } from "./limparSala.js";
import { tentarSairMasmorra } from "./sairMasmorra.js";
import { verificarFimDeJogo } from "../verificar/derrota/derrota.js";

const prompt = promptSync({ sigint: true });

export function jogadaMasmorra(jogador) {
  // Use o loop 'while' para manter o jogador na masmorra
  while (jogador.masmorraAtual) {
    console.log(
      `\n${colors.bright}Você está em uma masmorra! O que deseja fazer?${colors.reset}`
    );
    console.log(
      `🧭 [01] Mover | 🔎 [02] Olhar | 🔍 [03] Investigar | 🚪 [0] Sair`
    );
    const escolhaMasmorra = prompt("Escolha: ");

    switch (escolhaMasmorra) {
      case "1": {
        // Mover
        console.log("Para onde? ([01]Norte / [02]Sul / [03]Leste / [04]Oeste)");
        const direcaoEscolhida = prompt(">> ");
        let direcaoConvertida;

        switch (direcaoEscolhida) {
          case "1":
            direcaoConvertida = "norte";
            break;
          case "2":
            direcaoConvertida = "sul";
            break;
          case "3":
            direcaoConvertida = "leste";
            break;
          case "4":
            direcaoConvertida = "oeste";
            break;
          default:
            direcaoConvertida = direcaoEscolhida;
            break;
        }

        const resultado = jogador.masmorraAtual.move(direcaoConvertida);

        if (
          resultado.type === "batalha" ||
          resultado.type === "miniboss" ||
          resultado.type === "boss"
        ) {
          console.log(resultado.msg);
          const vitoria = batalha(resultado.inimigo, jogador);
          if (vitoria) {
            limparSalaMasmorra(jogador);
            // Se o jogador vence, o loop deve continuar, mas a sala está limpa.
            // Nada precisa ser feito aqui, pois o loop 'while' se encarregará do próximo turno.
          } else {
            // Se o jogador perde a batalha, o jogo deve terminar.
            if (verificarFimDeJogo(jogador)) return;
          }
        } else if (resultado.type === "armadilha") {
          console.log(resultado.msg);
          jogador.hp -= resultado.dano;
          console.log(
            `Você recebeu ${resultado.dano} de dano! HP atual: ${jogador.hp}`
          );
          if (verificarFimDeJogo(jogador)) return;
        } else if (resultado.type === "tesouro") {
          console.log(resultado.msg);
        } else {
          console.log(resultado.msg);
        }
        break;
      }

      case "2": {
        // Olhar
        console.log(jogador.masmorraAtual.look());
        break;
      }

      case "3": {
        // Investigar
        const resultadoInvestigacao = jogador.masmorraAtual.investigate();
        console.log(resultadoInvestigacao.msg);
        if (resultadoInvestigacao.result === "triggered") {
          jogador.hp -= resultadoInvestigacao.dano;
          console.log(
            `Você recebeu ${resultadoInvestigacao.dano} de dano! HP atual: ${jogador.hp}`
          );
          if (verificarFimDeJogo(jogador)) return;
        }
        break;
      }

      case "0":
        // Lógica para sair da masmorra
        if (tentarSairMasmorra(jogador)) {
          return; // Sai da função se a saída for bem-sucedida
        }
        break;

      default: {
        console.log("Comando inválido. Tente novamente.");
        break;
      }
    }
  }
}
