import { colors } from "./../utilitarios.js";

// A função menuPrincipal agora apenas exibe o menu
export async function exibirMenuPrincipal(jogador) {
  // Inicializa flag de história
  if (jogador.ativarHistoria === undefined) {
    jogador.ativarHistoria = true;
  }

  console.log(`\n${colors.bright}O que deseja fazer agora?${colors.reset}`);
  console.log(`🌳 [1] Explorar`);
  console.log(`📝 [2] Fazer uma missão`);
  console.log(`🛌 [3] Descansar`);
  console.log(`📊 [4] Status / Inventário`);
  console.log(`🔮 [5] Craftar`);
  console.log(`💰 [6] Loja`);
  console.log(`🏰 [7] Enfrentar Torre`);
  console.log(`⚙️  [8] Configurações`);
  console.log(`${colors.reset}🚪 [0] Sair do jogo${colors.reset}`);
}
