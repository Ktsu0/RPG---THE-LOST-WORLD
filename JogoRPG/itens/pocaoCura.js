import { rand } from "./../utilitarios.js";

// --- Usar Poção ---
export function usarPocao(jogador) {
  // Verifica se há poções no inventário
  const index = jogador.itens.findIndex((item) => item === "Poção de Cura");
  if (index === -1) {
    console.log("❌ Você não possui nenhuma Poção de Cura!");
    return false;
  }

  // Remove a poção do inventário
  jogador.itens.splice(index, 1);

  // Recupera HP (por exemplo, 30 a 50)
  const cura = rand(30, 50);
  jogador.hp = Math.min(jogador.hp + cura, jogador.hpMax);

  console.log(
    `💊 Você usou uma Poção de Cura e recuperou ${cura} HP! (HP: ${jogador.hp}/${jogador.hpMax})`
  );
  return true;
}
