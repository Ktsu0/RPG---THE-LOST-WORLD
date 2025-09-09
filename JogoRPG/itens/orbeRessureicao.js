export function verificarMorte(jogador) {
  // Passo 1: Verifica se a vida do jogador chegou a 0 ou menos.
  if (jogador.hp <= 0) {
    console.log("\nVocê caiu em batalha...");

    // Passo 2: Procura pela Orbe da Fênix no inventário.
    const orbeIndex = jogador.inventario.findIndex(
      (item) => item.nome === "Orbe da Fênix Flamejante"
    );

    // Passo 3: Se a Orbe for encontrada...
    if (orbeIndex !== -1) {
      console.log(
        `${colors.magenta}O Orbe da Fênix Flamejante em seu inventário se quebra, e uma aura o envolve!${colors.reset}`
      );

      // Ressuscita com 50% da vida total
      jogador.hp = Math.floor(jogador.hpMax * 0.5);

      // Limpa todo o inventário (removendo todos os itens, inclusive a orbe)
      jogador.inventario = [];

      console.log(
        `${colors.green}Você ressuscitou com 50% de vida, mas toda a sua carga foi perdida no processo!${colors.reset}`
      );
    } else {
      // Passo 4: Se a Orbe NÃO for encontrada...
      console.log(
        `${colors.red}Seus ferimentos foram fatais. O mundo está perdido...${colors.reset}`
      );
      process.exit(0); // Termina o programa
    }
  }
}
