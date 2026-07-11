export function criarGradeDeTracado(tracado, legenda) {
  return tracado.map((linha, y) =>
    [...linha].map((simbolo, x) => {
      const definicao = legenda[simbolo];
      if (!definicao) {
        throw new Error(`Símbolo "${simbolo}" não está na legenda (linha ${y}, coluna ${x}).`);
      }
      return { x, y, ...definicao };
    })
  );
}

export function celulaEm(grade, x, y) {
  const linha = grade[y];
  if (!linha) return null;
  return linha[x] ?? null;
}

function vizinhosCaminhaveis(grade, celula) {
  const candidatos = [
    celulaEm(grade, celula.x, celula.y - 1),
    celulaEm(grade, celula.x, celula.y + 1),
    celulaEm(grade, celula.x + 1, celula.y),
    celulaEm(grade, celula.x - 1, celula.y),
  ];
  return candidatos.filter((c) => c && c.tipo !== "parede");
}

export function caminhoAte(grade, origem, destino) {
  if (origem.x === destino.x && origem.y === destino.y) return [];

  const chave = ({ x, y }) => `${x},${y}`;
  const anterior = new Map([[chave(origem), null]]);
  const fila = [origem];

  while (fila.length > 0) {
    const atual = fila.shift();
    for (const vizinho of vizinhosCaminhaveis(grade, atual)) {
      const k = chave(vizinho);
      if (anterior.has(k)) continue;
      anterior.set(k, atual);

      if (vizinho.x === destino.x && vizinho.y === destino.y) {
        const caminho = [vizinho];
        let passo = atual;
        while (passo && !(passo.x === origem.x && passo.y === origem.y)) {
          caminho.unshift(passo);
          passo = anterior.get(chave(passo));
        }
        return caminho;
      }
      fila.push(vizinho);
    }
  }
  return null;
}

export function alcancavel(grade, origem, destino) {
  return caminhoAte(grade, origem, destino) !== null;
}
