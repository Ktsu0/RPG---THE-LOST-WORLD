// --- Calcular ataque total do jogador ---
export function calcularAtaque(jogador) {
  let atk = jogador.ataque || 0;

  // Bônus por nível
  atk += Math.floor(jogador.nivel * 2); // Bônus de equipamentos (somando todos os atkBonus)

  const equipamentos = Object.values(jogador.equipamentos).filter((it) => it);
  const atkBonus = equipamentos.reduce(
    (acc, it) => acc + (Number(it.atkBonus) || 0), // ✅ MUDANÇA AQUI!
    0
  );
  atk += atkBonus;

  // Bônus extra do set ou outros bônus de ataque
  atk += jogador.bonusAtk || 0;

  // Bônus do amuleto (2% do ataque base)
  if (jogador.amuletoEquipado) {
    const atkBase = jogador.ataqueOriginal || jogador.ataque || 0;
    atk += Math.floor(atkBase * 0.02);
  } // Bônus da arma equipada

  if (jogador.armaEquipada && jogador.armaEquipada.atk) {
    atk += Number(jogador.armaEquipada.atk) || 0; // ✅ MUDANÇA AQUI!
  }

  return atk;
}
