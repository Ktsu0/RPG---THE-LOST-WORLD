import { colors } from "./../../../utilitarios.js";

export function processarSangramento(inimigo) {
  if (!inimigo.status) return;
  inimigo.status = inimigo.status.filter((efeito) => {
    if (efeito.tipo === "sangramento") {
      console.log(
        `${colors.red}🩸 O inimigo sofre ${efeito.dano} de dano por sangramento!${colors.reset}`
      );
      inimigo.hp -= efeito.dano;
      efeito.duracao--;
      if (efeito.duracao <= 0) {
        console.log(
          `${colors.green}✅ O sangramento no inimigo parou.${colors.reset}`
        );
        return false;
      }
    }
    return true;
  });
}
