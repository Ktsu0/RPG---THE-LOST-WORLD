import { colors } from "./../../../utilitarios.js";

export function processarDanoExtra(inimigo) {
  if (!inimigo.status) return;

  inimigo.status = inimigo.status.filter((efeito) => {
    if (efeito.tipo === "dano_extra") {
      efeito.duracao--;
      if (efeito.duracao <= 0) {
        console.log(
          `\n🔥 ${colors.green}A fúria do ${inimigo.nome} se acalmou.${colors.reset}`
        );
        return false; // remove o efeito
      }
    }
    return true; // mantém o efeito ativo
  });
}
