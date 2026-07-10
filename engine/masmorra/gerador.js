import { rand } from "@engine/combate/aleatorio.js";

export const templatesMasmorra = [
  {
    id: "cripta-esquecida",
    nome: "Cripta Esquecida",
    tema: "cripta",
    mobs: ["Esqueleto Errante", "Zumbi Apodrecido", "Aranha da Cripta"],
    minibosses: ["Cavaleiro Caído"],
    boss: { nome: "Lich Menor", poder: 1.4 },
    trapChance: 15,
    secretChance: 10,
  },
  {
    id: "caverna-de-cristal",
    nome: "Caverna de Cristal",
    tema: "caverna",
    mobs: ["Morcego Gigante", "Golem de Cristal", "Aranha Venenosa"],
    minibosses: ["Guardião de Cristal"],
    boss: { nome: "Elemental de Cristal", poder: 1.3 },
    trapChance: 12,
    secretChance: 12,
  },
  {
    id: "covil-vulcanico",
    nome: "Covil Vulcânico",
    tema: "vulcao",
    mobs: ["Salamandra de Fogo", "Imp Menor", "Escorpião de Magma"],
    minibosses: ["Comandante Ígneo"],
    boss: { nome: "Senhor das Chamas", poder: 1.5 },
    trapChance: 18,
    secretChance: 8,
  },
];

export function determinarDificuldade(nivel) {
  if (nivel < 5) return rand(1, 5);
  if (nivel < 10) return rand(3, 8);
  return rand(5, 10);
}

function criarGradeVazia(size) {
  const grid = [];
  for (let y = 0; y < size; y++) {
    const linha = [];
    for (let x = 0; x < size; x++) {
      linha.push({ x, y, visited: false, roomType: "vazio", content: null });
    }
    grid.push(linha);
  }
  return grid;
}

function distanciaManhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function gerarMasmorra(jogador, templateId, options = {}) {
  const size = options.size || 5;
  const template = templatesMasmorra.find((t) => t.id === templateId) || templatesMasmorra[0];
  const grid = criarGradeVazia(size);
  const centro = { x: Math.floor(size / 2), y: Math.floor(size / 2) };

  grid[centro.y][centro.x].roomType = "entrada";
  grid[centro.y][centro.x].visited = true;

  const candidatos = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!(x === centro.x && y === centro.y)) candidatos.push(grid[y][x]);
    }
  }

  const candidatosPorDistancia = [...candidatos].sort(
    (a, b) => distanciaManhattan(b, centro) - distanciaManhattan(a, centro)
  );
  const celulaBoss = candidatosPorDistancia[0];
  celulaBoss.roomType = "boss";
  celulaBoss.content = { nome: template.boss.nome, poder: template.boss.poder };

  const restantes = candidatos.filter((c) => c !== celulaBoss);
  const minibossCount = Math.min(restantes.length, rand(1, 3));
  for (let i = 0; i < minibossCount; i++) {
    const idx = rand(0, restantes.length - 1);
    const celula = restantes.splice(idx, 1)[0];
    celula.roomType = "miniboss";
    celula.content = { nome: template.minibosses[rand(0, template.minibosses.length - 1)] };
  }

  const mobRoomsCount = Math.min(restantes.length, rand(4, 8));
  for (let i = 0; i < mobRoomsCount; i++) {
    const idx = rand(0, restantes.length - 1);
    const celula = restantes.splice(idx, 1)[0];
    celula.roomType = "monstro";
    celula.content = { nome: template.mobs[rand(0, template.mobs.length - 1)] };
  }

  for (const celula of restantes) {
    const rolagem = rand(1, 100);
    if (rolagem <= template.trapChance) {
      celula.roomType = "trap";
    } else if (rolagem <= template.trapChance + template.secretChance) {
      celula.roomType = "secret";
    } else if (rolagem <= template.trapChance + template.secretChance + 10) {
      celula.roomType = "treasure";
    }
  }

  return { template, size, grid, entrance: centro, bossPos: { x: celulaBoss.x, y: celulaBoss.y } };
}
