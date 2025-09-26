import { colors } from "./../utilitarios.js";

export async function menuConfiguracoes(jogador) {
  while (true) {
    console.log(`\n${colors.bright}⚙️ Configurações${colors.reset}`);

    const statusHistoria = jogador.ativarHistoria
      ? `${colors.green}ATIVADO${colors.reset}`
      : `${colors.red}DESATIVADO${colors.reset}`;
    console.log(`\nModo de História: ${statusHistoria}`);

    console.log(`\n[1] Alternar Modo de História`);
    console.log(`[2] Voltar`);

    // Espera a entrada do usuário de forma assíncrona
    const escolha = await new Promise((resolve) => {
      process.stdin.once("data", (key) => {
        resolve(key.toString().trim());
      });
    });

    switch (escolha) {
      case "1":
        jogador.ativarHistoria = !jogador.ativarHistoria;
        break;
      case "2":
        console.log("Voltando para o menu principal...");
        return;
      default:
        console.log("Escolha inválida, tente novamente.");
        break;
    }
  }
}
