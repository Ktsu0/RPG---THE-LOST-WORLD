import { catalogoLoja } from "@engine/itens/catalogo.js";
import { obterClasseRaridade } from "@engine/itens/raridade.js";
import { comprarItem, itensVendiveis, venderItens } from "@engine/loja/index.js";

function renderizarCabecalho(container, jogador) {
  const cabecalho = container.querySelector(".cabecalho-loja");
  cabecalho.innerHTML = `<span class="ouro-atual">Ouro: ${jogador.ouro}</span>`;
}

function renderizarAbaComprar(container, jogador, atualizarTudo) {
  const lista = container.querySelector(".lista-comprar");
  lista.innerHTML = "";
  for (const item of catalogoLoja) {
    const linha = document.createElement("div");
    linha.className = "painel item-loja";
    linha.dataset.itemLoja = item.id;
    const classeRaridade = obterClasseRaridade(item.raridade);
    linha.innerHTML = `
      <span class="${classeRaridade}">${item.nome}</span>
      <span>${item.preco} ouro</span>
      <button class="botao" data-acao="comprar">Comprar</button>
    `;
    linha.querySelector("[data-acao='comprar']").addEventListener("click", () => {
      comprarItem(jogador, item);
      atualizarTudo();
    });
    lista.appendChild(linha);
  }
}

function renderizarAbaVender(container, jogador, atualizarTudo) {
  const lista = container.querySelector(".lista-vender");
  lista.innerHTML = "";
  const selecionados = new Set();

  itensVendiveis(jogador.inventario).forEach((item) => {
    const indiceReal = jogador.inventario.indexOf(item);
    const linha = document.createElement("button");
    linha.className = "botao item-vender";
    linha.dataset.venderIndice = indiceReal;
    linha.textContent = `${item.nome} — ${Math.floor(item.preco * 0.3)} ouro`;
    linha.addEventListener("click", () => {
      if (selecionados.has(indiceReal)) {
        selecionados.delete(indiceReal);
        linha.classList.remove("opcao--selecionada");
      } else {
        selecionados.add(indiceReal);
        linha.classList.add("opcao--selecionada");
      }
    });
    lista.appendChild(linha);
  });

  const botaoConfirmar = document.createElement("button");
  botaoConfirmar.className = "botao botao--destaque";
  botaoConfirmar.dataset.acao = "confirmar-venda";
  botaoConfirmar.textContent = "Confirmar venda";
  botaoConfirmar.addEventListener("click", () => {
    venderItens(jogador, [...selecionados]);
    atualizarTudo();
  });
  lista.appendChild(botaoConfirmar);
}

export function montarTelaLoja(container, { jogador, aoSair }) {
  container.innerHTML = `
    <div class="tela-loja">
      <div class="painel cabecalho-loja"></div>
      <div class="abas-loja">
        <button class="botao aba-comprar aba--ativa" data-aba="comprar">Comprar</button>
        <button class="botao aba-vender" data-aba="vender">Vender</button>
      </div>
      <div class="lista-comprar"></div>
      <div class="lista-vender" style="display: none;"></div>
      <button class="botao" id="botao-sair-loja">Sair da Loja</button>
    </div>
  `;

  function atualizarTudo() {
    renderizarCabecalho(container, jogador);
    renderizarAbaComprar(container, jogador, atualizarTudo);
    renderizarAbaVender(container, jogador, atualizarTudo);
  }

  const abaComprarBotao = container.querySelector(".aba-comprar");
  const abaVenderBotao = container.querySelector(".aba-vender");
  const listaComprar = container.querySelector(".lista-comprar");
  const listaVender = container.querySelector(".lista-vender");

  abaComprarBotao.addEventListener("click", () => {
    abaComprarBotao.classList.add("aba--ativa");
    abaVenderBotao.classList.remove("aba--ativa");
    listaComprar.style.display = "";
    listaVender.style.display = "none";
  });

  abaVenderBotao.addEventListener("click", () => {
    abaVenderBotao.classList.add("aba--ativa");
    abaComprarBotao.classList.remove("aba--ativa");
    listaComprar.style.display = "none";
    listaVender.style.display = "";
  });

  const botaoSair = container.querySelector("#botao-sair-loja");
  botaoSair.addEventListener("click", () => aoSair());

  atualizarTudo();

  return { botaoSair, abaComprar: abaComprarBotao, abaVender: abaVenderBotao };
}
