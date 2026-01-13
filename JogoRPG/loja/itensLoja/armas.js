// === Armas Disponíveis ===

function criarArma({
  id,
  nome,
  preco,
  atk,
  efeito = null,
  raridade = "comum",
}) {
  return { id, nome, slot: "weapon", preco, atk, efeito, raridade };
}

let idArma = 1;

export const armasDisponiveis = [
  criarArma({ id: idArma++, nome: "Espada Longa", preco: 2500, atk: 5 }),
  criarArma({
    id: idArma++,
    nome: "Arco Élfico",
    preco: 5000,
    atk: 4,
    efeito: { tipo: "esquiva", chance: 10 },
    raridade: "raro",
  }),
  criarArma({
    id: idArma++,
    nome: "Adaga Sombria",
    preco: 6500,
    atk: 6,
    efeito: { tipo: "sangramento", chance: 20, danoPorTurno: 5, duracao: 3 },
    raridade: "raro",
  }),
  criarArma({
    id: idArma++,
    nome: "Martelo de Guerra",
    preco: 7200,
    atk: 8,
    efeito: { tipo: "bloqueio", chance: 20 },
    raridade: "raro",
  }),
  criarArma({
    id: idArma++,
    nome: "Cajado do Caos",
    preco: 7800,
    atk: 7,
    efeito: { tipo: "confusao", chance: 25, duracao: 1 },
    raridade: "raro",
  }),
  criarArma({
    id: idArma++,
    nome: "Cajado Congelante",
    preco: 8500,
    atk: 6,
    efeito: { tipo: "congelamento", chance: 15, duracao: 1 },
    raridade: "raro",
  }),
  criarArma({
    id: idArma++,
    nome: "Machado Flamejante",
    preco: 9200,
    atk: 9,
    efeito: { tipo: "incendio", chance: 25, danoPorTurno: 7, duracao: 3 },
    raridade: "lendario",
  }),
  criarArma({
    id: idArma++,
    nome: "Lança Sagrada",
    preco: 10000,
    atk: 10,
    efeito: { tipo: "critico", chance: 15 },
    raridade: "lendario",
  }),
  criarArma({
    id: idArma++,
    nome: "Punhais Gêmeos",
    preco: 11500,
    atk: 5,
    efeito: { tipo: "ataque_duplo", chance: 20 },
    raridade: "lendario",
  }),
  criarArma({
    id: idArma++,
    nome: "Foice do Ceifador",
    preco: 12500,
    atk: 12,
    efeito: { tipo: "roubo_de_vida", percentual: 0.15 },
    raridade: "lendario",
  }),
];
