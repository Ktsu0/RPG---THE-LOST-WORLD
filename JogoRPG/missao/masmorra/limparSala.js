// Em um arquivo utilitário ou na sua masmorra.js
export function limparSalaMasmorra(jogador) {
  if (
    jogador.masmorraAtual &&
    jogador.posicao &&
    jogador.posicao.y !== undefined &&
    jogador.posicao.x !== undefined
  ) {
    const salaAtual =
      jogador.masmorraAtual.grid[jogador.posicao.y][jogador.posicao.x];
    salaAtual.roomType = "vazio";
    salaAtual.content = null;
    console.log(
      `\n${colors.cyan}A sala foi limpa e marcada no seu mapa.${colors.reset}`
    );
  }
}
