import { colors } from "./../../../utilitarios.js";

export function processarBuffDefesa(inimigo) {
  if (!inimigo.status) return;

  // Filtra e processa APENAS o status defesa_extra
  inimigo.status = inimigo.status.filter((efeito) => {
    if (efeito.tipo === "defesa_extra") {
      efeito.duracao--; // Reduz a duração

      if (efeito.duracao <= 0) {
        console.log(
          `\n🛡️ O efeito de petrificação do ${inimigo.nome} se desfez, voltando ao normal.${colors.reset}`
        );
        return false; // Remove o efeito
      }
    }
    return true; // Mantém o efeito ativo
  });
}
