// --- Calcular defesa total do inimigo ---
export function calcularDefesaFinal(inimigo) {
  let def = Number(inimigo.defesa) || 0;

  // Caso queira adicionar outros bônus fixos no futuro
  def += inimigo.bonusDef || 0;

  return def;
}
