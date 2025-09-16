export function mostrarBonusDoSet(set) {
  switch (set) {
    case "Ferro":
      return "+15% chance de bloquear ataque!";
    case "Ligeiro":
      return "+15% esquiva!";
    case "Sombra":
      return "+10% crítico e +10% esquiva!";
    case "Dragão":
      return "+10% HP e +10% ATK!";
    default:
      return "Nenhum bônus especial.";
  }
}
