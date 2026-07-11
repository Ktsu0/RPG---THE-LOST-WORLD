import { criarSessaoMasmorra, mover, tentarSairMasmorra, limparSala } from "@engine/masmorra/index.js";
import { templatesMasmorra } from "@engine/masmorra/gerador.js";
import { criarInimigoDaSala } from "@engine/masmorra/inimigoDaSala.js";
import { iniciarBatalha } from "../batalha/controladorBatalha.js";

const SIMBOLO_POR_TIPO = {
  entrada: "E", boss: "B", miniboss: "M", monstro: "!",
  trap: "trap", secret: "?", treasure: "$", vazio: ".",
};

const TIPOS_COM_ENCONTRO = new Set(["monstro", "miniboss", "boss"]);

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
  const areaGrade = container.querySelector(".grade-masmorra");
  const areaControles = container.querySelector(".controles-masmorra");

  function renderizarGrade() {
    areaGrade.innerHTML = "";
    areaGrade.style.display = "grid";
    areaGrade.style.gridTemplateColumns = `repeat(${sessao.dungeon.size}, 1fr)`;

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
        areaGrade.appendChild(div);
      }
    }
  }
  renderizarGrade();

  function celulaAtualDaSessao() {
    return sessao.dungeon.grid[sessao.posicao.y][sessao.posicao.x];
  }

  function verificarEncontro() {
    const celula = celulaAtualDaSessao();
    if (!TIPOS_COM_ENCONTRO.has(celula.roomType)) return;

    const inimigo = criarInimigoDaSala(celula, jogador);
    areaGrade.style.display = "none";
    areaControles.style.display = "none";

    const areaBatalha = document.createElement("div");
    container.querySelector(".tela-masmorra").insertBefore(areaBatalha, areaControles);

    iniciarBatalha(areaBatalha, jogador, inimigo, {
      onFim: (fim) => {
        areaBatalha.remove();
        if (fim === "vitoria") {
          limparSala(sessao);
          areaGrade.style.display = "";
          areaControles.style.display = "";
          renderizarGrade();
        } else {
          // Derrota ou fuga: sai da masmorra em vez de deixar o jogador
          // preso numa sala com um monstro que ele não pode mais enfrentar
          // (não há tela de "game over" própria da masmorra — reaproveita
          // o mesmo caminho de saída do botão "Sair da Masmorra").
          aoSair();
        }
      },
    });
  }

  function moverPara(direcao) {
    const resultado = mover(sessao, direcao);
    if (!resultado.saiuDosLimites) {
      sessao = resultado.sessao;
      renderizarGrade();
      verificarEncontro();
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
