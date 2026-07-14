import { obterClasseRaridade } from "@engine/itens/raridade.js";
import { equiparArmaduraNoSlot, equiparArma, compararAtributos } from "@engine/itens/equipar.js";
import { xpParaProximoNivel } from "@engine/personagem/experiencia.js";
import { calcularAtaqueJogador, calcularDefesaJogador } from "@engine/combate/calculoDano.js";
import { iconePorSlot } from "../../itens/iconePorSlot.js";

function renderizarAtributos(container, jogador) {
  const painel = container.querySelector(".painel-atributos");
  // Ataque/Defesa exibidos já incluem equipamentos, conjuntos e amuleto (mesmo
  // cálculo usado em combate) — mostrar jogador.ataque/defesa "cru" faria a tela
  // nunca refletir o equipamento, quebrando o critério de pronto da fase
  // ("equipar → ficar mensuravelmente mais forte").
  painel.innerHTML = `
    <h2>${jogador.nome}</h2>
    <p>${jogador.raca} — ${jogador.classe}</p>
    <p>Nível ${jogador.nivel} (XP: ${jogador.xp}/${xpParaProximoNivel(jogador)})</p>
    <p>HP: ${jogador.hp}/${jogador.hpMax}</p>
    <p>Ataque: ${calcularAtaqueJogador(jogador)} | Defesa: ${calcularDefesaJogador(jogador)}</p>
    <p>Ouro: ${jogador.ouro}</p>
  `;
}

function renderizarInventario(container, jogador, atualizarTudo) {
  const lista = container.querySelector(".lista-inventario-equipavel");
  lista.innerHTML = "";

  // Materiais de craft (recompensa de missão, ex. "Pena do Corvo Sombrio") são strings
  // soltas no inventário, não objetos de item — nunca são equipáveis. Sem esse filtro
  // de tipo, item.slot é undefined e passa no `!== "consumable"`, aparecendo como
  // "undefined DEF +0" e corrompendo jogador.equipamentos.undefined se equipado.
  const equipaveis = jogador.inventario.filter(
    (item) => typeof item === "object" && item !== null && item.slot && item.slot !== "consumable"
  );
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
      <span class="icone-item icone-item--${iconePorSlot(item.slot)}"></span>
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
