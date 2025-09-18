import { menuAmuletoSupremo } from "./amuleto/menuAmuleto.js";
import { colors } from "./../../utilitarios.js";
import { menuTalismaSupremo } from "./talisma/menuTalisma.js";

import promptSync from "prompt-sync";
const prompt = promptSync();
// --- Menu de seleção para Amuleto ou Talismã ---
export function menuAmuletoTalisma(jogador) {
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

  const opcao = prompt("Escolha: ");
  if (opcao === "1") {
    menuAmuletoSupremo(jogador);
  } else if (opcao === "2") {
    menuTalismaSupremo(jogador);
  } else if (opcao === "0") {
    console.log("Voltando...");
  } else {
    console.log("Opção inválida.");
  }
}
