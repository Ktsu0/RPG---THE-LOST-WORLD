import { colors } from "./../utilitarios.js";

// Em um arquivo utilitário ou na sua masmorra.js
export function limparSalaMasmorra(jogador) {
  if (
    jogador.masmorraAtual &&
    jogador.masmorraAtual.state &&
    jogador.masmorraAtual.state.x !== undefined &&
    jogador.masmorraAtual.state.y !== undefined
  ) {
    const x = jogador.masmorraAtual.state.x;
    const y = jogador.masmorraAtual.state.y;
    const salaAtual = jogador.masmorraAtual.grid[y][x];
    
    if (salaAtual) {
      salaAtual.roomType = "vazio";
      salaAtual.content = null;
      console.log(
        `\n${colors.cyan}✅ A sala foi limpa e marcada no seu mapa.${colors.reset}`
      );
    }
  } else {
    console.log(
      `\n${colors.yellow}⚠ Não foi possível limpar a sala (posição não encontrada).${colors.reset}`
    );
  }
}
