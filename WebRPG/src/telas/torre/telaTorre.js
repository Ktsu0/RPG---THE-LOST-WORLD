import { criarEstadoTorre, avancarAndar, executarTurnoTorre, podeAcessarTorre, consumirTalismaDaTorre } from "@engine/torre/index.js";
import { checarLevelUp } from "@engine/personagem/experiencia.js";
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
  if (!podeAcessarTorre(jogador)) {
    container.innerHTML = `
      <div class="painel">
        <p>Você precisa do Talismã da Torre para entrar.</p>
        <p>Construa um na tela de Personagem: 10 Fragmento Antigo + 2000 ouro.</p>
        <button class="botao" id="botao-sair-torre-bloqueada">Voltar</button>
      </div>
    `;
    container.querySelector("#botao-sair-torre-bloqueada").addEventListener("click", () => aoSair());
    return { botaoSair: null };
  }

  consumirTalismaDaTorre(jogador);
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
      <div class="overlay-fim-torre overlay-fim-torre--oculto"></div>
    </div>
  `;

  let estado = criarEstadoTorre(jogador);
  ({ estado } = avancarAndar(estado));

  const andarAtual = container.querySelector(".andar-atual");
  const nomeBoss = container.querySelector(".nome-boss");
  const log = container.querySelector(".log-torre");
  const barraBoss = container.querySelector(".barra-boss");
  const spriteBoss = container.querySelector(".sprite-boss");
  const overlayFimTorre = container.querySelector(".overlay-fim-torre");
  const acoesTorre = container.querySelector(".acoes-torre");

  function atualizarCabecalho() {
    andarAtual.textContent = `Andar ${estado.andar}`;
    nomeBoss.textContent = estado.bossAtual ? estado.bossAtual.nome : "";
    if (estado.bossAtual) {
      barraBoss.style.width = `${Math.max(0, (estado.bossAtual.hp / estado.bossAtual.hpMax) * 100)}%`;
      tocarAnimacao(spriteBoss, spriteParaInimigo(estado.bossAtual.nome), "idle");
    }
  }
  atualizarCabecalho();

  function adicionarLinhaLog(texto) {
    const linha = document.createElement("p");
    linha.textContent = texto;
    log.appendChild(linha);
    log.scrollTop = log.scrollHeight;
  }

  function desabilitarAcoes() {
    for (const botao of acoesTorre.querySelectorAll("button")) botao.disabled = true;
  }

  function mostrarFimDeTentativa({ titulo, mensagem }) {
    desabilitarAcoes();
    overlayFimTorre.innerHTML = `
      <h2 class="texto-pixel">${titulo}</h2>
      <p>${mensagem}</p>
      <button class="botao botao--destaque" id="botao-voltar-cidade-torre">Voltar à Cidade</button>
    `;
    overlayFimTorre.classList.remove("overlay-fim-torre--oculto");
    container.querySelector("#botao-voltar-cidade-torre").addEventListener("click", () => aoSair());
  }

  function logarLevelUp() {
    for (const evento of checarLevelUp(estado.jogador)) {
      adicionarLinhaLog(`🎉 Nível ${evento.nivel}! HP máximo: ${evento.hpMax}`);
    }
  }

  async function executar(acao) {
    const resultado = executarTurnoTorre(estado, acao);
    estado = resultado.estado;
    for (const evento of resultado.eventos) {
      const mensagem = descreverEvento(evento);
      if (mensagem) adicionarLinhaLog(mensagem);
    }
    atualizarCabecalho();

    if (resultado.fim === "venceu_andar") {
      logarLevelUp();
      ({ estado } = avancarAndar(estado));
      atualizarCabecalho();
    } else if (resultado.fim === "torre_completa") {
      logarLevelUp();
      const eventoFinal = resultado.eventos.find((e) => e.tipo === "torre_completa");
      mostrarFimDeTentativa({
        titulo: "Você derrotou o Lorde do Caos!",
        mensagem: `A maldição da Torre foi quebrada. Você recebe o Cálice da Vitória e +${eventoFinal.ouroBonus} de ouro!`,
      });
    } else if (resultado.fim === "derrota") {
      mostrarFimDeTentativa({ titulo: "Derrotado...", mensagem: "Você precisará de outro Talismã da Torre para tentar de novo." });
    } else if (resultado.fim === "fuga" && resultado.eventos.some((e) => e.tipo === "fuga" && e.sucesso)) {
      mostrarFimDeTentativa({ titulo: "Você fugiu da Torre", mensagem: "O Talismã já foi consumido — será preciso outro para tentar de novo." });
    }
  }

  container.querySelector('[data-acao="atacar"]').addEventListener("click", () => executar("atacar"));
  container.querySelector('[data-acao="fugir"]').addEventListener("click", () => executar("fugir"));

  const botaoSair = container.querySelector("#botao-sair-torre");
  botaoSair.addEventListener("click", () => aoSair());

  return { botaoSair, log, executarAcao: executar };
}
