import { colors, barraDeVida } from "./utilitarios.js";
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
  const hpMaxInimigo = inimigo.hpMax || inimigo.hp; // Fallback caso não tenha hpMax
  console.log(`\n${colors.bright}--- STATUS DE BATALHA ---${colors.reset}`);
  
  // INIMIGO (Vermelho)
  console.log(`INIMIGO: ${barraDeVida(inimigo.hp, hpMaxInimigo, 20, colors.red, colors.gray)}`);
  
  console.log(""); // Espaço

  // JOGADOR (Verde)
  console.log(`JOGADOR: ${barraDeVida(jogador.hp, jogador.hpMax, 20, colors.green, colors.gray)}`);
  
  console.log("-".repeat(40));
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
