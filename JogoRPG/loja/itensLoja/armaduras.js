// === Armaduras Disponíveis ===
export function criarItem({
  id,
  nome,
  slot,
  preco,
  defesa = 0,
  atkBonus = 0,
  set = null,
  raridade = "comum",
}) {
  return { id, nome, slot, defesa, atkBonus, preco, set, raridade };
}

let idCounter = 1;

export const conjuntos = {
  Ferro: [
    { nome: "Elmo de Ferro", slot: "head", defesa: 6, preco: 2050 },
    { nome: "Peitoral de Ferro", slot: "chest", defesa: 12, preco: 2880 },
    {
      nome: "Manoplas de Ferro",
      slot: "hands",
      defesa: 5,
      atkBonus: 1,
      preco: 1990,
    },
    { nome: "Grevas de Ferro", slot: "legs", defesa: 7, preco: 2250 },
    { nome: "Botas de Ferro", slot: "feet", defesa: 4, preco: 1850 },
  ],

  Ligeiro: [
    {
      nome: "Capuz de Velo",
      slot: "head",
      defesa: 3,
      atkBonus: 1,
      preco: 2050,
    },
    {
      nome: "Túnica Ligeira",
      slot: "chest",
      defesa: 6,
      atkBonus: 2,
      preco: 2910,
      raridade: "raro",
    },
    { nome: "Luvas Leves", slot: "hands", defesa: 2, atkBonus: 2, preco: 1850 },
    {
      nome: "Calças Ligeiras",
      slot: "legs",
      defesa: 4,
      atkBonus: 1,
      preco: 2050,
    },
    { nome: "Botas Ágeis", slot: "feet", defesa: 3, atkBonus: 1, preco: 1950 },
  ],

  Sombra: [
    {
      nome: "Máscara das Sombras",
      slot: "head",
      defesa: 4,
      atkBonus: 2,
      preco: 5450,
      raridade: "raro",
    },
    {
      nome: "Peitoral das Sombras",
      slot: "chest",
      defesa: 8,
      atkBonus: 3,
      preco: 5960,
      raridade: "raro",
    },
    {
      nome: "Luvas das Sombras",
      slot: "hands",
      defesa: 3,
      atkBonus: 2,
      preco: 5350,
      raridade: "raro",
    },
    {
      nome: "Calças das Sombras",
      slot: "legs",
      defesa: 5,
      atkBonus: 2,
      preco: 5610,
      raridade: "raro",
    },
    {
      nome: "Botas das Sombras",
      slot: "feet",
      defesa: 4,
      atkBonus: 2,
      preco: 5580,
      raridade: "raro",
    },
  ],

  Dragão: [
    {
      nome: "Elmo do Dragão",
      slot: "head",
      defesa: 12,
      atkBonus: 5,
      preco: 15510,
      raridade: "lendario",
    },
    {
      nome: "Peitoral do Dragão",
      slot: "chest",
      defesa: 20,
      atkBonus: 7,
      preco: 17510,
      raridade: "lendario",
    },
    {
      nome: "Manoplas do Dragão",
      slot: "hands",
      defesa: 8,
      atkBonus: 4,
      preco: 14950,
      raridade: "lendario",
    },
    {
      nome: "Grevas do Dragão",
      slot: "legs",
      defesa: 12,
      atkBonus: 4,
      preco: 15810,
      raridade: "lendario",
    },
    {
      nome: "Botas do Dragão",
      slot: "feet",
      defesa: 10,
      atkBonus: 3,
      preco: 14900,
      raridade: "lendario",
    },
  ],
};
