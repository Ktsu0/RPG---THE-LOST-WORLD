import { rand } from "./../utilitarios.js";
// --- Função para encontrar um baú de tesouro ---
export function encontrarTesouro(jogador) {
  console.log(
    `\n${colors.bright}📦 Você encontrou um baú de tesouro!${colors.reset}`
  );

  const ouroEncontrado = Math.floor(jogador.nivel * rand(20, 50));
  jogador.ouro += ouroEncontrado;
  console.log(
    `${colors.yellow}💰 Você encontrou ${ouroEncontrado} de ouro!${colors.reset}`
  );

  // 30% de chance de encontrar uma poção de cura
  if (rand(1, 100) <= 30) {
    jogador.itens.push("Poção de Cura");
    console.log(
      `${colors.blue}🧪 Você encontrou uma Poção de Cura!${colors.reset}`
    );
  }
}
