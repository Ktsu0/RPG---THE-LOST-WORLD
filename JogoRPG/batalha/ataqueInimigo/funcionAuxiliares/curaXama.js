import { colors, rand } from "./../../../utilitarios.js";

export function processarCuraXama(jogador) {
  // 1. Verifica se a classe é Xamã
  if (jogador.classe !== "Xamã") {
    return;
  }

  // 2. 50% de chance de cura
  if (rand(1, 100) <= 50) {
    // 3. Calcula 5% do HP Máximo
    const cura = Math.floor(jogador.hpMax * 0.05);

    // 4. Aplica a cura, sem exceder o HP Máximo
    const hpAnterior = jogador.hp;
    jogador.hp = Math.min(jogador.hpMax, jogador.hp + cura);

    // 5. Calcula o valor efetivo curado (caso o HP já estivesse no máximo)
    const curaEfetiva = jogador.hp - hpAnterior;

    if (curaEfetiva > 0) {
      console.log(
        `${colors.green}🌿 Sua natureza Xamã curou ${curaEfetiva} de HP!${colors.reset}`
      );
    }
  }
}
