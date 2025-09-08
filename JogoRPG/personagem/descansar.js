import { rand } from "./../utilitarios.js";
// --- Descansar ---
export function descansar(jogador) {
  const cura = Math.min(jogador.hpMax - jogador.hp, rand(15, 30));
  jogador.hp += cura;
  console.log(
    `\n🛌 Você descansou e recuperou ${cura} HP. (HP: ${jogador.hp}/${jogador.hpMax})`
  );
  // custo de tempo/risco: chance encontrar inimigo leve
  if (rand(1, 100) <= 20) {
    console.log("Durante o descanso você foi surpreendido!");
    batalha(criarInimigo(jogador), jogador);
  }
}
