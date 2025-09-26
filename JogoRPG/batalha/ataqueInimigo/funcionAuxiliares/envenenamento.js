import { colors } from "./../../../utilitarios.js";

export function processarEnvenenamento(jogador) {
  if (!jogador.status) return;

  jogador.status = jogador.status.filter((efeito) => {
    if (efeito.tipo === "envenenamento") {
      console.log(
        `${colors.green}🤢 Você sofre ${efeito.dano} de dano por envenenamento!${colors.reset}`
      );
      jogador.hp = Math.max(0, jogador.hp - efeito.dano);
      efeito.duracao--;
      if (efeito.duracao <= 0) {
        console.log(
          `${colors.green}✅ O envenenamento foi curado.${colors.reset}`
        );
        return false; // remove do status
      }
    }
    return true; // mantém o efeito ativo
  });
}

export function limparVenenoArauto(jogador) {
  jogador.status = jogador.status.filter((s) => s.tipo !== "envenenamento");
}
