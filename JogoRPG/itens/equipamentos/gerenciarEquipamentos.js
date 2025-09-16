import { jogador } from "./../../jogo.js";
import { colors } from "./../../utilitarios.js"; // importe seu colors
import { gerenciarArmaduras } from "./armaduras/armaduras.js";
import { gerenciarArmas } from "./armas/armas.js";
import promptSync from "prompt-sync";
const prompt = promptSync();

// --- Gerenciar Equipamentos ---
export function gerenciarEquipamentos() {
  console.log(
    `\n${colors.bright}=== GERENCIAR EQUIPAMENTOS ===${colors.reset}`
  );

  while (true) {
    console.log(
      `\n${colors.green}[1] Trocar Armadura${colors.reset}  ${colors.green}[2] Trocar Arma${colors.reset}  ${colors.gray}[0] Sair${colors.reset}`
    );
    const escolha = prompt("Escolha: ");

    if (escolha === "1") {
      gerenciarArmaduras(jogador);
    } else if (escolha === "2") {
      gerenciarArmas(jogador);
    } else if (escolha === "0") {
      break;
    } else {
      console.log(`${colors.red}Opção inválida.${colors.reset}`);
    }
  }
}
