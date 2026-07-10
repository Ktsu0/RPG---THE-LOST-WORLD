import { filtroMissao, resolverResultadoMissao } from "@engine/missoes/index.js";
import { criarEstadoOndas, avancarOnda, TOTAL_ONDAS } from "@engine/missoes/ondas.js";

function renderizarResultado(container, resultado) {
  const painel = container.querySelector(".resultado-missao");
  if (resultado.sucesso) {
    painel.innerHTML = `
      <p>Missão completada com sucesso! +${resultado.xpGanho} XP, +${resultado.ouroGanho} ouro.</p>
      ${resultado.itemGanho ? `<p>Você obteve: ${resultado.itemGanho}</p>` : ""}
      ${resultado.pocaoGanha ? "<p>Você também encontrou uma Poção de Cura!</p>" : ""}
    `;
  } else {
    painel.innerHTML = `<p>A missão falhou. ${resultado.penalidade.mensagem}</p>`;
  }
}

function resolverMissaoDeOndas(container, jogador, missao) {
  let estadoOndas = criarEstadoOndas(jogador);
  while (estadoOndas.onda <= TOTAL_ONDAS) {
    const resultado = avancarOnda(estadoOndas);
    estadoOndas = resultado.estado;
  }
  jogador.xp += Math.round(missao.xp(jogador.nivel));
  jogador.ouro += Math.round(missao.ouro(jogador.nivel));
  for (let i = 0; i < estadoOndas.fragmentosGanhos; i++) {
    jogador.inventario.push("Fragmento Antigo");
  }
  renderizarResultado(container, {
    sucesso: true,
    xpGanho: Math.round(missao.xp(jogador.nivel)),
    ouroGanho: Math.round(missao.ouro(jogador.nivel)),
    itemGanho: estadoOndas.fragmentosGanhos > 0 ? `${estadoOndas.fragmentosGanhos}x Fragmento Antigo` : null,
    pocaoGanha: false,
  });
}

export function montarTelaGuilda(container, { jogador, aoSair }) {
  container.innerHTML = `
    <div class="tela-guilda">
      <div class="painel painel-missao">
        <p class="descricao-missao"></p>
        <p class="historia-missao"></p>
      </div>
      <div class="acoes-missao">
        <button class="botao botao--destaque" id="botao-aceitar-missao">Aceitar</button>
      </div>
      <div class="resultado-missao"></div>
      <button class="botao" id="botao-sair-guilda">Voltar</button>
    </div>
  `;

  const missao = filtroMissao(jogador);
  const painelMissao = container.querySelector(".painel-missao");
  const botaoAceitar = container.querySelector("#botao-aceitar-missao");

  if (!missao) {
    painelMissao.innerHTML = "<p>Não há missões disponíveis para o seu nível no momento.</p>";
    botaoAceitar.disabled = true;
  } else {
    container.querySelector(".descricao-missao").textContent = missao.descricao;
    container.querySelector(".historia-missao").textContent = missao.historia;
  }

  botaoAceitar.addEventListener("click", () => {
    botaoAceitar.disabled = true;
    if (missao.tipoBatalha === "ondas") {
      resolverMissaoDeOndas(container, jogador, missao);
    } else {
      const resultado = resolverResultadoMissao(jogador, missao);
      renderizarResultado(container, resultado);
    }
  });

  const botaoSair = container.querySelector("#botao-sair-guilda");
  botaoSair.addEventListener("click", () => aoSair());

  return { botaoAceitar, botaoSair };
}
