import { obterClasseRaridade } from "@engine/itens/raridade.js";
import { equiparArmaduraNoSlot, equiparArma, compararAtributos } from "@engine/itens/equipar.js";
import { xpParaProximoNivel } from "@engine/personagem/experiencia.js";
import { calcularAtaqueJogador, calcularDefesaJogador } from "@engine/combate/calculoDano.js";
import {
  REQUISITOS_AMULETO, podeCraftarAmuleto, craftarAmuleto, alternarAmuleto,
  PRECO_TALISMA, podeCraftarTalisma, craftarTalisma,
} from "@engine/itens/amuletoTalisma.js";
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

function renderizarPainelAmuleto(container, jogador, atualizarTudo) {
  const painel = container.querySelector(".painel-amuleto");
  const progresso = REQUISITOS_AMULETO.map((req) => {
    const qtd = jogador.inventario.filter((item) => item === req.nome).length;
    return `<li>${req.nome}: ${qtd}/${req.quantidade}</li>`;
  }).join("");

  if (!jogador.amuletoCraftado) {
    const podeCraftar = podeCraftarAmuleto(jogador.inventario);
    painel.innerHTML = `
      <h3>Amuleto Supremo</h3>
      <p>+5% Ataque, +10% HP máximo quando equipado.</p>
      <ul>${progresso}</ul>
      <button class="botao" id="botao-craftar-amuleto" ${podeCraftar ? "" : "disabled"}>Craftar Amuleto</button>
    `;
    painel.querySelector("#botao-craftar-amuleto").addEventListener("click", () => {
      craftarAmuleto(jogador);
      atualizarTudo();
    });
  } else {
    painel.innerHTML = `
      <h3>Amuleto Supremo</h3>
      <p>Status: ${jogador.amuletoEquipado ? "Equipado" : "Guardado"}</p>
      <button class="botao" id="botao-alternar-amuleto">${jogador.amuletoEquipado ? "Desequipar" : "Equipar"}</button>
    `;
    painel.querySelector("#botao-alternar-amuleto").addEventListener("click", () => {
      alternarAmuleto(jogador);
      atualizarTudo();
    });
  }
}

function renderizarPainelTalisma(container, jogador, atualizarTudo) {
  const painel = container.querySelector(".painel-talisma");
  const jaTemTalisma = jogador.inventario.includes("Talismã da Torre");
  const fragmentos = jogador.inventario.filter((i) => i === "Fragmento Antigo").length;

  if (jaTemTalisma) {
    painel.innerHTML = `<h3>Talismã da Torre</h3><p>Você tem um Talismã pronto para uso — leve-o à Torre.</p>`;
    return;
  }

  const podeCraftar = podeCraftarTalisma(jogador);
  painel.innerHTML = `
    <h3>Talismã da Torre</h3>
    <p>A chave que abre os portões da Torre dos bosses finais — é consumida ao entrar.</p>
    <ul>
      <li>Fragmento Antigo: ${fragmentos}/${PRECO_TALISMA.fragmentos}</li>
      <li>Ouro: ${jogador.ouro}/${PRECO_TALISMA.ouro}</li>
    </ul>
    <button class="botao" id="botao-craftar-talisma" ${podeCraftar ? "" : "disabled"}>Craftar Talismã</button>
  `;
  painel.querySelector("#botao-craftar-talisma").addEventListener("click", () => {
    craftarTalisma(jogador);
    atualizarTudo();
  });
}

export function montarTelaPersonagem(container, { jogador, aoSair }) {
  container.innerHTML = `
    <div class="tela-personagem">
      <div class="painel painel-atributos"></div>
      <div class="painel painel-amuleto"></div>
      <div class="painel painel-talisma"></div>
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
    renderizarPainelAmuleto(container, jogador, atualizarTudo);
    renderizarPainelTalisma(container, jogador, atualizarTudo);
  }
  atualizarTudo();

  const botaoSair = container.querySelector("#botao-sair-personagem");
  botaoSair.addEventListener("click", () => aoSair());

  return { botaoSair };
}
