import { colors } from "./../../../utilitarios.js";

export function processarInvulneravel(inimigo) {
  if (!inimigo.status) return;
  inimigo.status = inimigo.status.filter((efeito) => {
    if (efeito.tipo === "invulneravel") {
      efeito.duracao--;
      if (efeito.duracao <= 0) {
        console.log(
          `${colors.green}✅ ${inimigo.nome} não está mais invulnerável.${colors.reset}`
        );
        return false; // remove efeito
      }
    }
    return true;
  });
}
