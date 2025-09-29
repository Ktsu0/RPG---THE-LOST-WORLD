export function processarRegeneracao(inimigo) {
  if (inimigo.habilidade !== "regeneracao") {
    return; // Sai se o inimigo não tem a habilidade
  }

  // 30% de chance de ativação
  if (rand(1, 100) <= 100) {
    const hpRegen = Math.floor(inimigo.hpMax * 0.05);
    inimigo.hp = Math.min(inimigo.hp + hpRegen, inimigo.hpMax);
    console.log(`\n💚 ${inimigo.nome} regenerou ${hpRegen} HP!`);
  }
}
