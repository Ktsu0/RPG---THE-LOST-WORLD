import { rand } from "@engine/combate/aleatorio.js";

// Cada espécie usa o mesmo sprite já mapeado em WebRPG/src/telas/batalha/mapaSprites.js
// (ver entradas "Selvagem" nesse arquivo) — id aqui é só a chave de vínculo, não um asset.
export const especiesSelvagens = [
  { id: "goblin", nome: "Goblin Selvagem", hp: 18, atk: 6, defesa: 2, xp: 8, ouro: 6 },
  { id: "orc", nome: "Orc Selvagem", hp: 28, atk: 9, defesa: 4, xp: 14, ouro: 10 },
  { id: "esqueleto", nome: "Esqueleto Solto", hp: 22, atk: 7, defesa: 3, xp: 10, ouro: 8 },
  { id: "lobo", nome: "Lobo Selvagem", hp: 20, atk: 8, defesa: 2, xp: 11, ouro: 7 },
  { id: "cogumelo", nome: "Cogumelo Venenoso", hp: 24, atk: 5, defesa: 6, xp: 9, ouro: 5 },
  { id: "elemental-fogo", nome: "Elemental de Fogo Selvagem", hp: 26, atk: 10, defesa: 3, xp: 15, ouro: 9 },
  { id: "golem-pedra", nome: "Golem de Pedra Selvagem", hp: 35, atk: 6, defesa: 10, xp: 16, ouro: 11 },
  { id: "olho-voador", nome: "Olho Voador Selvagem", hp: 16, atk: 8, defesa: 1, xp: 12, ouro: 8 },
];

export function listarEspeciesSelvagens() {
  return especiesSelvagens;
}

export function obterEspecieSelvagem(id) {
  const especie = especiesSelvagens.find((e) => e.id === id);
  if (!especie) {
    throw new Error(`Espécie selvagem "${id}" não existe.`);
  }
  return especie;
}

export function criarInimigoSelvagem(id, nivelJogador = 1) {
  const especie = obterEspecieSelvagem(id);
  const escala = 1 + Math.max(0, nivelJogador - 1) * 0.12 + rand(0, 10) / 100;

  return {
    nome: especie.nome,
    hp: Math.round(especie.hp * escala),
    hpMax: Math.round(especie.hp * escala),
    atk: Math.round(especie.atk * escala),
    defesa: Math.round(especie.defesa * escala),
    xp: Math.round(especie.xp * escala),
    ouro: Math.round(especie.ouro * escala),
    habilidade: null,
    status: [],
  };
}
