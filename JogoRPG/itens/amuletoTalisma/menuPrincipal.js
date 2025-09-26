import { menuAmuletoSupremo } from "./amuleto/menuAmuleto.js";
import { colors } from "./../../utilitarios.js";
import { menuTalismaSupremo } from "./talisma/menuTalisma.js";
import { exibirMenuPrincipal } from "./../../menuPrincipal/menuPrincipal.js";

// Função adaptada
export async function menuAmuletoTalisma(jogador) {
  // Exibe as opções para o jogador
  console.log(
    `\n${colors.bright}🔮 ${colors.magenta}Menu de Itens Místicos 🔮${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.blue}[1] Amuleto Supremo${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.blue}[2] Talismã da Torre${colors.reset}`
  );
  console.log(`${colors.red}[0] Voltar${colors.reset}`);

  // Aguarda a escolha do jogador de forma assíncrona
  const escolha = await new Promise((resolve) => {
    process.stdin.once("data", (key) => {
      resolve(key.toString().trim());
    });
  });

  // Processa a escolha
  switch (escolha) {
    case "1":
      // Certifique-se de que menuAmuletoSupremo também seja uma função assíncrona
      await menuAmuletoSupremo(jogador);
      break;
    case "2":
      // Certifique-se de que menuTalismaSupremo também seja uma função assíncrona
      await menuTalismaSupremo(jogador);
      break;
    case "0":
      console.log("Voltando...");
      await exibirMenuPrincipal();
      break;
    default:
      console.log("Opção inválida.");
      break;
  }
}
