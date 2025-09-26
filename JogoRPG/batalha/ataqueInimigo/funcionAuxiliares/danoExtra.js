export function processarDanoExtra(inimigo, jogador) {
  // Aplica status se jogador estiver com vida baixa
  if (
    inimigo.habilidade === "dano_extra" &&
    jogador.hp < jogador.hpMax * 0.5 &&
    !inimigo.status.some((s) => s.tipo === "dano_extra")
  ) {
    console.log(`\n🔥 ${inimigo.nome} está mais forte com sua vida baixa!`);
    inimigo.status.push({ tipo: "dano_extra", duracao: 3 });
  }
}
