import { colors, barraDeVida } from "./utilitarios.js";

// Stub para promptSync no navegador
let prompt;
try {
  if (typeof window !== "undefined") {
    prompt = (msg) => window.prompt(msg);
  } else {
    // We use a dynamic import here, but since this file is imported as a module
    // in the browser, we need to ensure this doesn't crash.
    // However, top-level await is better.
    // For now, let's just use a stub that won't crash the browser's parser.
    prompt = () => {};
  }
} catch (e) {
  prompt = () => {};
}

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
  console.log(
    `INIMIGO: ${barraDeVida(
      inimigo.hp,
      hpMaxInimigo,
      20,
      colors.red,
      colors.gray
    )}`
  );

  console.log(""); // Espaço

  // JOGADOR (Verde)
  console.log(
    `JOGADOR: ${barraDeVida(
      jogador.hp,
      jogador.hpMax,
      20,
      colors.green,
      colors.gray
    )}`
  );

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
