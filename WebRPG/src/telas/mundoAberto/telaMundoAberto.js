import { montarFaseExploracao } from "../../mundo/faseExploracao.js";

export function montarTelaMundoAberto(container, { jogador, aoEncontrarMonstro, aoSair }) {
  container.innerHTML = `
    <div class="tela-mundo-aberto">
      <div class="painel cabecalho-mundo-aberto">
        <strong>${jogador.nome}</strong>
        <span>HP: ${jogador.hp}/${jogador.hpMax}</span>
        <button class="botao" id="botao-voltar-cidade">Voltar para a cidade</button>
      </div>
      <p class="dica-mundo-aberto">Use as setas ou WASD para andar. Encoste em um monstro para lutar.</p>
      <div class="palco-mundo-aberto"></div>
    </div>
  `;

  const fase = montarFaseExploracao(container.querySelector(".palco-mundo-aberto"), {
    jogador,
    aoEncontrarMonstro: (especieId) => {
      fase.destruir();
      aoEncontrarMonstro(especieId);
    },
  });

  container.querySelector("#botao-voltar-cidade").addEventListener("click", () => {
    fase.destruir();
    aoSair();
  });

  return { destruir: fase.destruir };
}
