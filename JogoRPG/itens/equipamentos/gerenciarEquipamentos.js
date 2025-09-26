import { jogador } from "./../../jogo.js";
import { colors } from "./../../utilitarios.js";
import { gerenciarArmaduras } from "./armaduras/armaduras.js";
import { gerenciarArmas } from "./armas/armas.js";

// A função agora é assíncrona
export async function gerenciarEquipamentos() {
  console.log(
    `\n${colors.bright}=== GERENCIAR EQUIPAMENTOS ===${colors.reset}`
  );

  // Usa um loop assíncrono para esperar a entrada do usuário
  while (true) {
    console.log(
      `\n${colors.green}[1] Trocar Armadura${colors.reset}  ${colors.green}[2] Trocar Arma${colors.reset}  ${colors.gray}[0] Sair${colors.reset}`
    );

    const escolha = await new Promise((resolve) => {
      process.stdin.once("data", (key) => {
        resolve(key.toString().trim());
      });
    });

    if (escolha === "1") {
      await gerenciarArmaduras(jogador);
    } else if (escolha === "2") {
      await gerenciarArmas(jogador);
    } else if (escolha === "0") {
      break;
    } else {
      console.log(`${colors.red}Opção inválida.${colors.reset}`);
    }
  }
}
