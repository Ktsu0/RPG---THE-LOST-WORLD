// --- Calcular defesa total do jogador ---
export function calcularDefesaTotal(jogador) {
  // Defesa base do jogador
  let def = jogador.defesa || 0;

  // Soma de defesa dos equipamentos
  const equipamentos = Object.values(jogador.equipamentos).filter((it) => it);
  for (const it of equipamentos) {
    def += it.defesa || 0;
  }

  // Bônus adicional de defesa do set ou outros bônus
  def += jogador.bonusDef || 0;

  return def;
}
