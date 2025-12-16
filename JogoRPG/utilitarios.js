// Cores ANSI para o console
export const colors = {
  // Reset
  reset: "\x1b[0m",

  // Estilos
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  // Cores da fonte (Foreground)
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",

  // Cores do fundo (Background)
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};


export function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function lerInput(mensagem) {
  if (mensagem) process.stdout.write(mensagem);
  return new Promise((resolve) => {
    process.stdin.once("data", (key) => {
      resolve(key.toString().trim());
    });
  });
}

export function exibirTitulo(texto, cor = colors.cyan) {
  const linha = "=".repeat(texto.length + 8);
  console.log(`\n${cor}${linha}`);
  console.log(`    ${texto.toUpperCase()}    `);
  console.log(`${linha}${colors.reset}\n`);
}

export function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function barraDeVida(atual, max, tamanho = 20, corCheia = colors.green, corVazia = colors.red) {
  const porcentagem = Math.max(0, Math.min(1, atual / max));
  const preenchido = Math.round(tamanho * porcentagem);
  const vazio = tamanho - preenchido;
  
  // Barra ultra sólida (█)
  const parteCheia = `${corCheia}${"█".repeat(preenchido)}${colors.reset}`;
  const parteVazia = `${corVazia}${"█".repeat(vazio)}${colors.reset}`;
  
  return `${parteCheia}${parteVazia} ${atual}/${max}`;
}
