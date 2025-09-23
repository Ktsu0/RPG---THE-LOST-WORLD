import { colors } from "./../../utilitarios.js";

export function verificarFimDeJogo(jogador) {
  if (jogador.hp <= 0) {
    // Procura Orbe da Fênix
    const orbeIndex = jogador.inventario.findIndex(
      (item) => item.nome === "Orbe da Fênix Flamejante"
    );

    if (orbeIndex !== -1) {
      console.log(
        `${colors.magenta}O Orbe da Fênix Flamejante se quebra, e uma aura o envolve!${colors.reset}`
      );
      // Ressuscita com 50% de vida
      jogador.hp = Math.floor(jogador.hpMax * 0.5);
      jogador.inventario = [];
      console.log(
        `${colors.green}Você ressuscitou com 50% de vida, mas todo seu inventário foi perdido!${colors.reset}`
      );
      return false; // Retorna false para continuar o jogo
    } else {
      console.log(
        `${colors.red}💀 Seus ferimentos foram fatais. O mundo está perdido...${colors.reset}`
      );
      console.log(
        `\n${colors.bright}${colors.white}--- JOGO ENCERRADO ---${colors.reset}`
      );
      process.exit(); // <-- Adicione esta linha para encerrar o jogo
      return true;
    }
  }
  return false;
}
