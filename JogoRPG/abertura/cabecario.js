import { promisify } from "util";
import { colors } from "./../utilitarios.js";
import readline from "readline";

const delay = promisify(setTimeout);

// Variável para controlar se o jogador pulou a introdução
let introSkipped = false;

// Função para imprimir texto caractere por caractere com checagem de "pular"
async function printCharByChar(text, charDelay = 40) {
  for (const char of text) {
    if (introSkipped) {
      // Se o jogador pulou, imprime o resto da linha e sai
      process.stdout.write(text.substring(text.indexOf(char)));
      process.stdout.write("\n");
      return;
    }
    process.stdout.write(char);
    await delay(charDelay);
  }
  process.stdout.write("\n");
}

export async function exibirStatusInicial(jogador) {
  console.clear();

  // Cria uma interface de leitura para escutar a entrada do usuário
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Escuta o evento 'line' (quando o usuário pressiona Enter)
  rl.on("line", (input) => {
    introSkipped = true;
  });

  // --- INTRODUÇÃO COM EFEITO DE DIGITANDO ---
  const introText = [
    `Há séculos, o Reino de Eldoria vive em um pesadelo sem fim.`,
    `A noite não é mais ausência de luz, é um abismo que respira, devorando a esperança dos homens.`,
    `Das sombras mais profundas, hordas de criaturas surgiram, saqueando nossas terras, sequestrando a Princesa Myria e banindo o sono e a paz.`,
    `Por anos, os cantos dos pássaros foram silenciados, substituídos pelos lamentos daqueles que sucumbem à escuridão.`,
    ``,
    `Mas as lendas sussurram sobre uma profecia:`,
    `${colors.magenta}"Quando a última estrela do céu cair, surgirá um herói, forjado pelo caos, que empunhará a luz e desafiará a própria escuridão."${colors.reset}`,
    ``,
    `O herói destinado irá crescer com cada batalha, explorando cada canto deste mundo em ruínas,\naté que a ${colors.bright}${colors.cyan}Torre do Destino${colors.reset} se erga como sua última e definitiva barreira.`,
    ``,
  ];

  console.log(
    `${colors.dim}(Pressione ENTER para pular a introdução)${colors.reset}`
  );
  console.log("\n");

  for (const line of introText) {
    await printCharByChar(line, 40);
    // Saída do loop se a flag for ativada
    if (introSkipped) {
      break;
    }
    await delay(800);
  }

  // Fecha a interface de leitura
  rl.close();

  // Garante a transição imediata e limpa
  await delay(100); // Pequeno delay para a transição
  console.clear();

  // --- TEXTO DE STATUS INICIAL ---
  console.log(
    `${colors.bright}${colors.magenta}=== RPG - THE LOST WORLD ===${colors.reset}`
  );
  console.log(
    `\n${colors.bright}${colors.white}Bem-vindo, ${colors.magenta}${jogador.nome}!${colors.reset}\n${colors.bright}${colors.white}Você, que escuta o eco da profecia, pergunta-se... ${colors.bright}Será você o herói?${colors.reset}\n`
  );
}
