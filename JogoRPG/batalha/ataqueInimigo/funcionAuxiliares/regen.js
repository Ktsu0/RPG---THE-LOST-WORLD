export function processarRegeneracao(inimigo) {
  if (inimigo.habilidade === "regeneracao" && rand(1, 100) <= 30) {
    // 30% chance
    const hpRegen = Math.floor(inimigo.hpMax * 0.05);
    inimigo.hp = Math.min(inimigo.hp + hpRegen, inimigo.hpMax);
    console.log(`\n💚 ${inimigo.nome} regenerou ${hpRegen} HP!`);
  }
}
