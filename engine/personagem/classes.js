export const classes = [
  { nome: "Arqueiro", descricao: "Esquiva + bônus drop de ouro", bonus: { habilidade: "esquiva", atk: 0, def: 0, dropOuro: 10, dropItem: 0, critChance: 0, esquiva: 10, bloqueioChance: 0 } },
  { nome: "Paladino", descricao: "Crítico + chance de bloquear ataques", bonus: { habilidade: "bloqueio", atk: 0, def: 0, dropOuro: 0, dropItem: 0, critChance: 10, esquiva: 0, bloqueioChance: 10 } },
  { nome: "Assassino", descricao: "Sangramento + bônus drop de itens", bonus: { habilidade: "sangramento", atk: 0, def: 0, dropOuro: 0, dropItem: 10, critChance: 0, esquiva: 0, bloqueioChance: 0 } },
  { nome: "Bárbaro", descricao: "Fúria quando HP baixo", bonus: { habilidade: "furia", atk: 8, def: 0, dropOuro: 0, dropItem: 0, critChance: 0, esquiva: 0, bloqueioChance: 0 } },
  { nome: "Necromante", descricao: "Invocar esqueleto aliado", bonus: { habilidade: "invocacao", atk: 5, def: 0, dropOuro: 0, dropItem: 0, critChance: 0, esquiva: 0, bloqueioChance: 0 } },
  { nome: "Xamã", descricao: "Chance de cura de 5% HP por turno + bônus esquiva", bonus: { habilidade: "cura", atk: 0, def: 0, dropOuro: 0, dropItem: 0, critChance: 0, esquiva: 15, bloqueioChance: 0 } },
];

export function listarClasses() {
  return classes;
}

export function obterClasse(nome) {
  const classe = classes.find((c) => c.nome === nome);
  if (!classe) {
    throw new Error(`Classe "${nome}" não existe.`);
  }
  return classe;
}
