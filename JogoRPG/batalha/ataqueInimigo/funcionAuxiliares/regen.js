import { colors, rand } from "./../../../utilitarios.js";
export function processarRegeneracao(inimigo) {
  if (inimigo.habilidade === "regeneracao") {
    if (rand(1, 100) <= 30) {
      const hpRegen = Math.floor(inimigo.hpMax * 0.07);
      inimigo.hp = Math.min(inimigo.hp + hpRegen, inimigo.hpMax);
      console.log(
        `\n💚 ${inimigo.nome} regenerou ${colors.green}${hpRegen}${colors.reset} HP!`
      );
    }
  } else {
    return;
  }
}
