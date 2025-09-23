import { colors, rand } from "./../utilitarios.js";

export function aplicarPenalidade(tipo, jogador) {
  if (tipo === "ouro") {
    const perda = rand(15, 100);
    jogador.ouro = Math.max(0, jogador.ouro - perda);
    return `${colors.yellow}💰 Você perdeu ${perda} de ouro!${colors.reset}`;
  }

  if (tipo === "hp") {
    const perda = Math.floor(jogador.hp * 0.2);
    jogador.hp = Math.max(1, jogador.hp - perda);
    return `${colors.red}❤️ Você perdeu ${perda} de HP!${colors.reset}`;
  }

  if (tipo === "item" && jogador.setCompleto) {
    if (rand(1, 100) <= 2) {
      const itemPerdido = jogador.removerItemAleatorio();
      return `${colors.red}🛡️ Você perdeu uma peça do seu set: ${itemPerdido}!${colors.reset}`;
    } else {
      return `${colors.green}🍀 Por sorte, não perdeu nenhum item.${colors.reset}`;
    }
  }

  return `${colors.cyan}⚖️ Sem penalidades graves desta vez.${colors.reset}`;
}
