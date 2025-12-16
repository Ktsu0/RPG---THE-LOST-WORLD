export const ITEMS_CONFIG = {
  potions: {
    cura: {
      nome: "Poção de Cura",
      minPercent: 0.15, // 15% HP
      maxPercent: 0.25, // 25% HP
      preco: 50, // Preço base (se usada em loja)
    },
    nectar: {
      nome: "Néctar da Vida Eterna",
      restaura: 1.0, // 100% HP
      raridade: "lendario"
    }
  },
  weapons: {
    // Exemplo de configuração futura
    baseCritChance: 5, // 5% base
  }
};
