import {
  podeAcessarArena, NIVEL_MINIMO_ARENA,
  calcularQuantidadeInimigos, isOndaMiniBoss, calcularPontos, calcularChanceFragmento,
  criarEstadoArena, confirmarCheckpoint, removerBonusArena,
} from "@engine/arena/index.js";
import { rand } from "@engine/combate/aleatorio.js";

export function montarTelaArena(container, { jogador, aoSair }) {
  if (!podeAcessarArena(jogador)) {
    container.innerHTML = `<div class="painel">Você precisa ser nível ${NIVEL_MINIMO_ARENA} para entrar na Arena.</div>`;
    return { botaoSair: null };
  }

  container.innerHTML = `
    <div class="tela-arena">
      <div class="painel cabecalho-arena">
        <span class="onda-atual"></span>
        <span class="pontos-atuais"></span>
      </div>
      <div class="painel log-arena"></div>
      <button class="botao botao--destaque" id="botao-avancar-onda">Avançar Onda</button>
      <button class="botao" id="botao-sair-arena">Sair da Arena</button>
    </div>
  `;

  let estadoArena = criarEstadoArena();

  function atualizarCabecalho() {
    container.querySelector(".onda-atual").textContent = `Onda ${estadoArena.onda}`;
    container.querySelector(".pontos-atuais").textContent = `Pontos: ${estadoArena.pontos}`;
  }
  atualizarCabecalho();

  container.querySelector("#botao-avancar-onda").addEventListener("click", () => {
    const miniBoss = isOndaMiniBoss(estadoArena.onda);
    const pontosGanhos = calcularPontos(estadoArena.onda, miniBoss);
    estadoArena.pontos += pontosGanhos;

    if (rand(1, 100) <= calcularChanceFragmento(estadoArena.onda, miniBoss)) {
      estadoArena.fragmentosNaoConfirmados += 1;
    }
    if (miniBoss) {
      estadoArena = confirmarCheckpoint(estadoArena);
    }

    const log = container.querySelector(".log-arena");
    const linha = document.createElement("p");
    linha.textContent = `Onda ${estadoArena.onda} (${calcularQuantidadeInimigos(estadoArena.onda)} inimigos) vencida! +${pontosGanhos} pontos.`;
    log.appendChild(linha);

    estadoArena.onda += 1;
    atualizarCabecalho();
  });

  const botaoSair = container.querySelector("#botao-sair-arena");
  botaoSair.addEventListener("click", () => {
    removerBonusArena(jogador, estadoArena);
    for (let i = 0; i < estadoArena.fragmentosConfirmados; i++) {
      jogador.inventario.push("Fragmento Antigo");
    }
    aoSair();
  });

  return { botaoSair };
}
