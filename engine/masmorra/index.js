import { rand } from "@engine/combate/aleatorio.js";
import { gerarMasmorra } from "./gerador.js";

const DELTAS = {
  norte: { dx: 0, dy: -1 },
  sul: { dx: 0, dy: 1 },
  leste: { dx: 1, dy: 0 },
  oeste: { dx: -1, dy: 0 },
};

export function criarSessaoMasmorra(jogador, templateId, options = {}) {
  const dungeon = gerarMasmorra(jogador, templateId, options);
  return { dungeon, posicao: { ...dungeon.entrance }, jogador };
}

export function mover(sessao, direcao) {
  const { dx, dy } = DELTAS[direcao];
  const novoX = sessao.posicao.x + dx;
  const novoY = sessao.posicao.y + dy;

  if (novoX < 0 || novoY < 0 || novoX >= sessao.dungeon.size || novoY >= sessao.dungeon.size) {
    return { sessao, celula: sessao.dungeon.grid[sessao.posicao.y][sessao.posicao.x], saiuDosLimites: true };
  }

  const celula = sessao.dungeon.grid[novoY][novoX];
  celula.visited = true;
  const novaSessao = { ...sessao, posicao: { x: novoX, y: novoY } };
  return { sessao: novaSessao, celula, saiuDosLimites: false };
}

export function limparSala(sessao) {
  const celula = sessao.dungeon.grid[sessao.posicao.y][sessao.posicao.x];
  celula.roomType = "vazio";
  celula.content = null;
}

export function tentarSairMasmorra(sessao) {
  const naEntrada = sessao.posicao.x === sessao.dungeon.entrance.x && sessao.posicao.y === sessao.dungeon.entrance.y;
  if (naEntrada) return { saiu: true, penalidade: null };

  if (rand(1, 100) <= 40) return { saiu: true, penalidade: "pocao" };
  if (rand(1, 100) <= 15) return { saiu: true, penalidade: "armadura" };
  if (rand(1, 100) <= 10) return { saiu: true, penalidade: "arma" };
  if (rand(1, 100) <= 30) return { saiu: true, penalidade: "ouro" };
  return { saiu: true, penalidade: null };
}
