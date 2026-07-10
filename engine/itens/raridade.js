export function obterClasseRaridade(raridade) {
  switch (raridade) {
    case "comum": return "raridade--comum";
    case "raro": return "raridade--raro";
    case "lendario": return "raridade--lendario";
    default: return "raridade--padrao";
  }
}
