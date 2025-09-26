export function processarTeia(inimigo, jogador) {
  if (inimigo.habilidade === "teia" && rand(1, 100) <= 25) {
    console.log(`\n🕸️ Você foi pego na teia! Não pode agir no próximo turno.`);
    jogador.status.push({ tipo: "paralisado", duracao: 1 });
  }
}
