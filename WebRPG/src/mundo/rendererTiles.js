import { criarSessaoMundo, mover as moverSessao, celulaAtual as celulaAtualSessao } from "@engine/mundo/index.js";
import { caminhoAte } from "@engine/mundo/grade.js";

const TECLA_PARA_DIRECAO = {
  ArrowUp: "norte", w: "norte", W: "norte",
  ArrowDown: "sul", s: "sul", S: "sul",
  ArrowRight: "leste", d: "leste", D: "leste",
  ArrowLeft: "oeste", a: "oeste", A: "oeste",
};

function direcaoEntre(origem, destino) {
  const dx = destino.x - origem.x;
  const dy = destino.y - origem.y;
  if (dx === 1 && dy === 0) return "leste";
  if (dx === -1 && dy === 0) return "oeste";
  if (dx === 0 && dy === 1) return "sul";
  if (dx === 0 && dy === -1) return "norte";
  throw new Error("Passo do caminho não é adjacente à posição atual.");
}

export function montarMundoTiles(container, { grade, posicaoInicial, aoMover }) {
  let sessao = criarSessaoMundo(grade, posicaoInicial);

  container.classList.add("mundo-grade");
  container.style.gridTemplateColumns = `repeat(${grade[0].length}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${grade.length}, 1fr)`;
  container.setAttribute("tabindex", "0");

  function renderizar() {
    container.innerHTML = "";
    for (const linha of sessao.grade) {
      for (const celula of linha) {
        const div = document.createElement("div");
        div.className = `celula-mundo celula-mundo--${celula.tipo}`;
        div.dataset.x = celula.x;
        div.dataset.y = celula.y;

        if (celula.tipo === "hotspot") {
          div.dataset.hotspot = celula.conteudo.hotspot;
          div.title = celula.conteudo.rotulo;
          div.textContent = celula.conteudo.rotulo[0];
        }

        if (celula.x === sessao.posicao.x && celula.y === sessao.posicao.y) {
          const jogador = document.createElement("div");
          jogador.className = "jogador-mundo";
          div.appendChild(jogador);
        }

        div.addEventListener("click", () => moverPorClique(celula));
        container.appendChild(div);
      }
    }
  }

  function aplicarMovimento(direcao) {
    const resultado = moverSessao(sessao, direcao);
    if (resultado.bloqueado) return;
    sessao = resultado.sessao;
    renderizar();
    aoMover(resultado.celula);
  }

  function moverPorClique(celulaAlvo) {
    const caminho = caminhoAte(sessao.grade, sessao.posicao, celulaAlvo);
    if (!caminho || caminho.length === 0) return;
    for (const passo of caminho) {
      const direcao = direcaoEntre(sessao.posicao, passo);
      aplicarMovimento(direcao);
    }
  }

  // O listener de teclado fica no próprio container (não em window/document):
  // o roteador (WebRPG/src/rotas/roteador.js) não tem um contrato de "desmontar",
  // ele só troca telas com elementoContainer.innerHTML = "". Um listener preso ao
  // container é removido do DOM junto com ele e não vaza entre navegações.
  function aoTeclaPressionada(evento) {
    const direcao = TECLA_PARA_DIRECAO[evento.key];
    if (direcao) {
      evento.preventDefault();
      aplicarMovimento(direcao);
    }
  }
  container.addEventListener("keydown", aoTeclaPressionada);

  renderizar();
  container.focus();

  return {
    mover: aplicarMovimento,
    celulaAtual: () => celulaAtualSessao(sessao),
    destruir: () => container.removeEventListener("keydown", aoTeclaPressionada),
  };
}
