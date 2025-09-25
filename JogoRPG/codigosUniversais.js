import { colors } from "./utilitarios.js";
import promptSync from "prompt-sync";
const prompt = promptSync({ sigint: true });

// --- Função genérica de escolha ---
export function escolherOpcao(promptMsg, opcoesValidas) {
  let escolha;
  do {
    escolha = prompt(promptMsg);
  } while (!opcoesValidas.includes(escolha));
  return escolha;
}

export function exibirStatusBatalha(jogador, inimigo) {
  console.log(
    `\nSeu HP: ${colors.green}${jogador.hp}/${jogador.hpMax}${colors.reset} | ${inimigo.nome} HP: ${colors.red}${inimigo.hp}${colors.reset}`
  );
}

export function getRaridadeCor(raridade) {
  switch (raridade) {
    case "comum":
      return colors.green; // Cinza para itens comuns
    case "raro":
      return colors.blue; // Azul para itens raros
    case "lendario":
      return colors.yellow; // Amarelo para itens lendarios
    default:
      return colors.reset; // Cor padrão
  }
}

export function menuConfiguracoes(jogador) {
  while (true) {
    console.log(`\n${colors.bright}⚙️ Configurações${colors.reset}`);

    const statusHistoria = jogador.ativarHistoria
      ? `${colors.green}ATIVADO${colors.reset}`
      : `${colors.red}DESATIVADO${colors.reset}`;
    console.log(`\nModo de História: ${statusHistoria}`);

    console.log(`\n[1] Alternar Modo de História`);
    console.log(`[0] Voltar`);

    const escolha = prompt("Escolha: ");

    switch (escolha) {
      case "1":
        jogador.ativarHistoria = !jogador.ativarHistoria;
        break;
      case "0":
        console.log("Voltando para o menu principal...");
        return;
      default:
        console.log("Escolha inválida, tente novamente.");
        break;
    }
  }
}
