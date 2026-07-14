import { criarEstadoTorre, avancarAndar, executarTurnoTorre } from "@engine/torre/index.js";
import { tocarAnimacao } from "../batalha/sprites.js";
import { spriteParaInimigo } from "../batalha/mapaSprites.js";
import { tocarMusica } from "@audio/musica.js";

function descreverEvento(evento) {
  switch (evento.tipo) {
    case "dano": return `${evento.autor === "jogador" ? "Você causou" : "O boss causou"} ${evento.valor} de dano${evento.critico ? " (crítico!)" : ""}.`;
    case "bloqueio": return "O boss bloqueou o ataque!";
    case "morte": return evento.alvo === "boss" ? "O boss foi derrotado!" : "Você foi derrotado...";
    case "sopro_do_dragao": return "O boss usa um sopro devastador!";
    case "petrificado": return "Você foi petrificado!";
    case "miniboss_invocado": return "O boss invoca reforços!";
    case "fuga": return evento.sucesso ? "Você fugiu com sucesso!" : "A fuga falhou!";
    default: return null;
  }
}

export function montarTelaTorre(container, { jogador, aoSair }) {
  tocarMusica("torre");
  container.innerHTML = `
    <div class="tela-torre">
      <div class="painel cabecalho-torre">
        <span class="andar-atual"></span>
        <span class="nome-boss"></span>
        <div class="barra"><div class="barra__preenchimento barra__preenchimento--hp barra-boss"></div></div>
      </div>
      <div class="palco-torre">
        <div class="sprite sprite-boss"></div>
      </div>
      <div class="painel log-torre"></div>
      <div class="acoes-torre">
        <button class="botao botao--destaque" data-acao="atacar">Atacar</button>
        <button class="botao" data-acao="fugir">Fugir</button>
      </div>
      <button class="botao" id="botao-sair-torre">Sair da Torre</button>
    </div>
  `;

  let estado = criarEstadoTorre(jogador);
  ({ estado } = avancarAndar(estado));

  const andarAtual = container.querySelector(".andar-atual");
  const nomeBoss = container.querySelector(".nome-boss");
  const log = container.querySelector(".log-torre");
  const barraBoss = container.querySelector(".barra-boss");
  const spriteBoss = container.querySelector(".sprite-boss");

  function atualizarCabecalho() {
    andarAtual.textContent = `Andar ${estado.andar}`;
    nomeBoss.textContent = estado.bossAtual ? estado.bossAtual.nome : "";
    if (estado.bossAtual) {
      barraBoss.style.width = `${Math.max(0, (estado.bossAtual.hp / estado.bossAtual.hpMax) * 100)}%`;
      tocarAnimacao(spriteBoss, spriteParaInimigo(estado.bossAtual.nome), "idle");
    }
  }
  atualizarCabecalho();

  async function executar(acao) {
    const resultado = executarTurnoTorre(estado, acao);
    estado = resultado.estado;
    for (const evento of resultado.eventos) {
      const mensagem = descreverEvento(evento);
      if (mensagem) {
        const linha = document.createElement("p");
        linha.textContent = mensagem;
        log.appendChild(linha);
      }
    }
    atualizarCabecalho();

    if (resultado.fim === "venceu_andar") {
      ({ estado } = avancarAndar(estado));
      atualizarCabecalho();
    }
  }

  container.querySelector('[data-acao="atacar"]').addEventListener("click", () => executar("atacar"));
  container.querySelector('[data-acao="fugir"]').addEventListener("click", () => executar("fugir"));

  const botaoSair = container.querySelector("#botao-sair-torre");
  botaoSair.addEventListener("click", () => aoSair());

  return { botaoSair, log, executarAcao: executar };
}
