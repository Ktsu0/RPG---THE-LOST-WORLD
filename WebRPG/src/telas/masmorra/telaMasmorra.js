import { criarSessaoMasmorra, mover, tentarSairMasmorra } from "@engine/masmorra/index.js";
import { templatesMasmorra } from "@engine/masmorra/gerador.js";

const SIMBOLO_POR_TIPO = {
  entrada: "E", boss: "B", miniboss: "M", monstro: "!",
  trap: "trap", secret: "?", treasure: "$", vazio: ".",
};

export function montarTelaMasmorra(container, { jogador, aoSair }) {
  container.innerHTML = `
    <div class="tela-masmorra">
      <div class="painel grade-masmorra"></div>
      <div class="controles-masmorra">
        <button class="botao" data-direcao="norte">Norte</button>
        <button class="botao" data-direcao="sul">Sul</button>
        <button class="botao" data-direcao="leste">Leste</button>
        <button class="botao" data-direcao="oeste">Oeste</button>
      </div>
      <button class="botao botao--destaque" id="botao-sair-masmorra">Sair da Masmorra</button>
    </div>
  `;

  let sessao = criarSessaoMasmorra(jogador, templatesMasmorra[0].id);

  function renderizarGrade() {
    const grade = container.querySelector(".grade-masmorra");
    grade.innerHTML = "";
    grade.style.display = "grid";
    grade.style.gridTemplateColumns = `repeat(${sessao.dungeon.size}, 1fr)`;

    for (const linha of sessao.dungeon.grid) {
      for (const celula of linha) {
        const div = document.createElement("div");
        div.className = "celula-masmorra";
        div.dataset.celula = `${celula.x}-${celula.y}`;
        const naPosicaoAtual = celula.x === sessao.posicao.x && celula.y === sessao.posicao.y;

        if (celula.visited) {
          div.classList.add("celula--visitada");
        }

        if (naPosicaoAtual) {
          div.classList.add("celula--jogador");
          div.textContent = "@";
        } else if (celula.visited) {
          div.textContent = SIMBOLO_POR_TIPO[celula.roomType] || ".";
        } else {
          div.classList.add("celula--oculta");
          div.textContent = "?";
        }
        grade.appendChild(div);
      }
    }
  }
  renderizarGrade();

  function moverPara(direcao) {
    const resultado = mover(sessao, direcao);
    if (!resultado.saiuDosLimites) {
      sessao = resultado.sessao;
      renderizarGrade();
    }
  }

  for (const botao of container.querySelectorAll("[data-direcao]")) {
    botao.addEventListener("click", () => moverPara(botao.dataset.direcao));
  }

  const botaoSairMasmorra = container.querySelector("#botao-sair-masmorra");
  botaoSairMasmorra.addEventListener("click", () => {
    tentarSairMasmorra(sessao);
    aoSair();
  });

  function botaoMover(direcao) {
    return container.querySelector(`[data-direcao="${direcao}"]`);
  }

  return { botaoSairMasmorra, botaoMover };
}
