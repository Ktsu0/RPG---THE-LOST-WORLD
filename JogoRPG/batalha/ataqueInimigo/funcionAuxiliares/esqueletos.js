import { colors } from "./../../../utilitarios.js";

export function ataqueEsqueletos(inimigo, esqueletos) {
  esqueletos.forEach((esq) => {
    if (esq.hp > 0) {
      inimigo.hp -= esq.atk;
      console.log(
        `${colors.dim}💀 Seu esqueleto causou ${esq.atk} de dano ao ${inimigo.nome}!${colors.reset}`
      );
    }
  });
  return esqueletos.filter((e) => e.hp > 0);
}
