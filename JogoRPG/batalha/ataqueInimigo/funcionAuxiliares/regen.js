export function processarRegeneracao(inimigo) {
  if (!inimigo.status) inimigo.status = [];
  // Só aplica se o inimigo tiver a habilidade de regeneração
  if (
    inimigo.habilidade?.tipo === "regeneracao" ||
    inimigo.habilidade === "regeneracao"
  ) {
    const hpRegen = Math.floor(inimigo.hpMax * 0.05);
    inimigo.hp = Math.min(inimigo.hp + hpRegen, inimigo.hpMax);
    console.log(`\n💚 ${inimigo.nome} regenerou ${hpRegen} HP!`);
  }
}
