import { colors } from "./../../../utilitarios.js";

export function processarParalisia(jogador) {
  if (!jogador.status) return false;

  // Encontra o status de paralisia
  const statusParalisia = jogador.status.find(
    (s) => s.tipo === "paralisado" || s.tipo === "teia"
  );

  if (statusParalisia) {
    // 1. Reduz a duração (Consome 1 turno)
    statusParalisia.duracao--;

    // 2. Verifica se a paralisia acabou
    if (statusParalisia.duracao <= 0) {
      jogador.status = jogador.status.filter(
        (s) => s.tipo !== statusParalisia.tipo
      );
      console.log(
        `\n🎉 ${colors.green}Você se libertou da teia!${colors.reset}`
      );
      return false; // Não está mais paralisado, pode agir
    }

    // 3. Status ainda ativo
    console.log(
      `\n🕸️ ${colors.yellow}Você está preso na teia e não pode agir!${colors.reset}`
    );
    return true; // Está paralisado, deve pular o turno
  }
  return false; // Não há paralisia
}
