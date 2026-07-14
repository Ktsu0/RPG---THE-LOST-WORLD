import { montarFaseCidade } from "../../mundo/faseCidade.js";

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
      <p class="dica-cidade">Ande com as setas ou WASD até um prédio para entrar.</p>
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

  // Exposto para permitir testar a navegação sem depender do Phaser/canvas de
  // verdade (que não roda sob jsdom — ver comentário em faseCidade.js).
  // Também usado pelo próprio jogo (via aoAtivarHotspot) — por isso destrói o
  // jogo Phaser antes de disparar a troca de tela: o roteador só troca o DOM
  // (elementoContainer.innerHTML = ""), não chama destruir() na tela anterior.
  function acionarHotspot(nome) {
    fase.destruir();
    ACOES_POR_HOTSPOT[nome]?.();
  }

  const fase = montarFaseCidade(container.querySelector(".mundo-cidade"), {
    jogador,
    aoAtivarHotspot: acionarHotspot,
  });

  if (!localStorage.getItem("webrpg_onboarding_visto")) {
    const dica = document.createElement("div");
    dica.className = "painel dica-onboarding";
    dica.innerHTML = `
      <p>Bem-vindo a The Lost World! Ande até um dos prédios no mapa para entrar — comece pela Guilda ou saindo para Explorar.</p>
      <button class="botao botao--destaque" id="botao-onboarding-ok">Entendi</button>
    `;
    container.querySelector(".tela-cidade").prepend(dica);
    dica.querySelector("#botao-onboarding-ok").addEventListener("click", () => {
      localStorage.setItem("webrpg_onboarding_visto", "1");
      dica.remove();
    });
  }

  return { cabecalho: container.querySelector(".cabecalho-cidade"), acionarHotspot, destruir: fase.destruir };
}
