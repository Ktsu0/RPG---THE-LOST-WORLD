import { obterClasseRaridade } from "@engine/itens/raridade.js";
import { equiparArmaduraNoSlot, equiparArma, compararAtributos } from "@engine/itens/equipar.js";
import { xpParaProximoNivel } from "@engine/personagem/experiencia.js";

function renderizarAtributos(container, jogador) {
  const painel = container.querySelector(".painel-atributos");
  painel.innerHTML = `
    <h2>${jogador.nome}</h2>
    <p>${jogador.raca} — ${jogador.classe}</p>
    <p>Nível ${jogador.nivel} (XP: ${jogador.xp}/${xpParaProximoNivel(jogador)})</p>
    <p>HP: ${jogador.hp}/${jogador.hpMax}</p>
    <p>Ataque: ${jogador.ataque} | Defesa: ${jogador.defesa}</p>
    <p>Ouro: ${jogador.ouro}</p>
  `;
}

function renderizarInventario(container, jogador, atualizarTudo) {
  const lista = container.querySelector(".lista-inventario-equipavel");
  lista.innerHTML = "";

  const equipaveis = jogador.inventario.filter((item) => item.slot === "weapon" || item.slot !== "consumable");
  for (const item of equipaveis) {
    const linha = document.createElement("div");
    linha.className = "painel item-inventario";
    linha.dataset.inventarioItem = item.nome;
    const classeRaridade = obterClasseRaridade(item.raridade);

    let diferencaHtml = "";
    if (item.slot === "weapon") {
      diferencaHtml = `<span>ATK: ${item.atk}</span>`;
    } else {
      const itemAtual = jogador.equipamentos[item.slot];
      const diferenca = compararAtributos(itemAtual, item);
      diferencaHtml = `<span class="diferenca-defesa">DEF ${diferenca.defesa >= 0 ? "+" : ""}${diferenca.defesa}</span>`;
    }

    linha.innerHTML = `
      <span class="${classeRaridade}">${item.nome}</span>
      ${diferencaHtml}
      <button class="botao" data-acao="equipar">Equipar</button>
    `;

    linha.querySelector("[data-acao='equipar']").addEventListener("click", () => {
      const indice = jogador.inventario.indexOf(item);
      jogador.inventario.splice(indice, 1);

      if (item.slot === "weapon") {
        const { itemAntigo } = equiparArma(jogador, item);
        if (itemAntigo) jogador.inventario.push(itemAntigo);
      } else {
        const { itemAntigo } = equiparArmaduraNoSlot(jogador, item);
        if (itemAntigo) jogador.inventario.push(itemAntigo);
      }
      atualizarTudo();
    });

    lista.appendChild(linha);
  }
}

export function montarTelaPersonagem(container, { jogador, aoSair }) {
  container.innerHTML = `
    <div class="tela-personagem">
      <div class="painel painel-atributos"></div>
      <div class="painel painel-inventario">
        <h3>Inventário</h3>
        <div class="lista-inventario-equipavel"></div>
      </div>
      <button class="botao" id="botao-sair-personagem">Voltar</button>
    </div>
  `;

  function atualizarTudo() {
    renderizarAtributos(container, jogador);
    renderizarInventario(container, jogador, atualizarTudo);
  }
  atualizarTudo();

  const botaoSair = container.querySelector("#botao-sair-personagem");
  botaoSair.addEventListener("click", () => aoSair());

  return { botaoSair };
}
