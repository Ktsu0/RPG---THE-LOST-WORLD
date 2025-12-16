import { sistemaBatalha } from "./../batalha/sistemaBatalha.js";
import { colors } from "./../utilitarios.js";
import { limparSalaMasmorra } from "./limparSala.js";
import { tentarSairMasmorra } from "./sairMasmorra.js";
import { verificarFimDeJogo } from "./../verificar/derrota/derrota.js";

// Flag global para evitar múltiplas instâncias
let masmorraRodando = false;
function exibirMemento() {
  console.log(
    `Use ${colors.green}W - A - S - D${colors.reset} para mover.\n` +
      `${colors.cyan}M${colors.reset} para olhar o mapa.\n` +
      `${colors.yellow}V${colors.reset} para investigar.\n` +
      `${colors.red}P${colors.reset} para sair.`
  );
}
export function jogadaMasmorra(jogador, sairCallback) {
  if (!jogador.masmorraAtual || masmorraRodando) return;
  masmorraRodando = true;

  console.log(`\n${colors.bright}Você entrou em uma masmorra!${colors.reset}`);
  exibirMemento();

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  function sairMasmorra() {
    process.stdin.removeListener("data", handleKey);
    process.stdin.setRawMode(false);
    masmorraRodando = false;
    jogador.masmorraAtual = null;
    if (sairCallback) sairCallback();
  }

  async function handleKey(key) {
    if (!jogador.masmorraAtual) return;
    if (key === "\u0003") process.exit();

    let direcaoConvertida = null;

    switch (key.toLowerCase()) {
      case "w":
        direcaoConvertida = "norte";
        break;
      case "s":
        direcaoConvertida = "sul";
        break;
      case "a":
        direcaoConvertida = "oeste";
        break;
      case "d":
        direcaoConvertida = "leste";
        break;

      case "m":
        console.log(jogador.masmorraAtual.look());
        exibirMemento();
        return;

      case "v": {
        const resultado = jogador.masmorraAtual.investigate();
        console.log(resultado.msg);
        if (resultado.result === "triggered") {
          jogador.hp -= resultado.dano;
          console.log(
            `Você recebeu ${resultado.dano} de dano! HP atual: ${jogador.hp}`
          );
          if (verificarFimDeJogo(jogador)) process.exit();
        }
        exibirMemento();
        return;
      }

      case "p":
        if (await tentarSairMasmorra(jogador)) {
          console.log("Você saiu da masmorra.");
          sairMasmorra();
        } else {
          console.log("Não é possível sair agora.");
          exibirMemento();
        }
        return;

      default:
        console.log("Comando inválido.");
        exibirMemento();
        return;
    }

    // --- Movimento ---
    if (direcaoConvertida) {
      const resultado = jogador.masmorraAtual.move(direcaoConvertida);
      console.log(resultado.msg);

      if (["batalha", "miniboss", "boss"].includes(resultado.type)) {
        // 🔴 Pausa controles da masmorra
        process.stdin.removeListener("data", handleKey);

        // Executa a batalha
        const vitoria = await sistemaBatalha(resultado.inimigo, jogador);

        if (vitoria) {
          limparSalaMasmorra(jogador);
        } else if (verificarFimDeJogo(jogador)) {
          process.exit();
        }

        // 🟢 Retoma controles da masmorra depois da batalha
        process.stdin.on("data", handleKey);
      } else if (resultado.type === "armadilha") {
        jogador.hp -= resultado.dano;
        console.log(
          `Você recebeu ${resultado.dano} de dano! HP atual: ${jogador.hp}`
        );
        if (verificarFimDeJogo(jogador)) process.exit();
      }

      exibirMemento();
    }
  }

  // Liga o listener
  process.stdin.on("data", handleKey);
}
