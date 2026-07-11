const DELTAS = {
  norte: { dx: 0, dy: -1 },
  sul: { dx: 0, dy: 1 },
  leste: { dx: 1, dy: 0 },
  oeste: { dx: -1, dy: 0 },
};

function celulaEmGrade(grade, x, y) {
  const linha = grade[y];
  if (!linha) return null;
  return linha[x] ?? null;
}

export function criarSessaoMundo(grade, posicaoInicial) {
  return { grade, posicao: { ...posicaoInicial } };
}

export function celulaAtual(sessao) {
  return celulaEmGrade(sessao.grade, sessao.posicao.x, sessao.posicao.y);
}

export function mover(sessao, direcao) {
  const delta = DELTAS[direcao];
  if (!delta) {
    throw new Error(`Direção desconhecida: ${direcao}`);
  }

  const novoX = sessao.posicao.x + delta.dx;
  const novoY = sessao.posicao.y + delta.dy;
  const celula = celulaEmGrade(sessao.grade, novoX, novoY);

  if (!celula || celula.tipo === "parede") {
    return { sessao, celula: celulaAtual(sessao), bloqueado: true };
  }

  const novaSessao = { ...sessao, posicao: { x: novoX, y: novoY } };
  return { sessao: novaSessao, celula, bloqueado: false };
}
