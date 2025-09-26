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
