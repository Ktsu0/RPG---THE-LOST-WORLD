import { criarMapaCidade, POSICAO_INICIAL_CIDADE } from "@engine/mundo/mapas/cidade.js";
import { montarMundoTiles } from "../../mundo/rendererTiles.js";

export function montarTelaCidade(container, {
  jogador, aoExplorar, aoAbrirGuilda, aoAbrirLoja, aoAbrirPersonagem,
  aoAbrirTorre, aoAbrirMasmorra, aoAbrirArena, aoAbrirConfiguracao,
}) {
  container.innerHTML = `
    <div class="tela-cidade">
      <div class="painel cabecalho-cidade">
        <strong>${jogador.nome}</strong>
        <span>Nível ${jogador.nivel}</span>
        <span>HP: ${jogador.hp}/${jogador.hpMax}</span>
        <span>Ouro: ${jogador.ouro}</span>
      </div>
      <div class="mundo-cidade"></div>
    </div>
  `;

  const ACOES_POR_HOTSPOT = {
    explorar: aoExplorar,
    guilda: aoAbrirGuilda,
    loja: aoAbrirLoja,
    personagem: aoAbrirPersonagem,
    torre: aoAbrirTorre,
    masmorra: aoAbrirMasmorra,
    arena: aoAbrirArena,
    configuracao: aoAbrirConfiguracao,
  };

  montarMundoTiles(container.querySelector(".mundo-cidade"), {
    grade: criarMapaCidade(),
    posicaoInicial: POSICAO_INICIAL_CIDADE,
    aoMover: (celula) => {
      if (celula.tipo === "hotspot") {
        ACOES_POR_HOTSPOT[celula.conteudo.hotspot]?.();
      }
    },
  });

  if (!localStorage.getItem("webrpg_onboarding_visto")) {
    const dica = document.createElement("div");
    dica.className = "painel dica-onboarding";
    dica.innerHTML = `
      <p>Bem-vindo a The Lost World! Ande até um dos locais no mapa (ou clique nele) para entrar — comece pela Guilda ou saindo para Explorar.</p>
      <button class="botao botao--destaque" id="botao-onboarding-ok">Entendi</button>
    `;
    container.querySelector(".tela-cidade").prepend(dica);
    dica.querySelector("#botao-onboarding-ok").addEventListener("click", () => {
      localStorage.setItem("webrpg_onboarding_visto", "1");
      dica.remove();
    });
  }

  return { cabecalho: container.querySelector(".cabecalho-cidade") };
}
