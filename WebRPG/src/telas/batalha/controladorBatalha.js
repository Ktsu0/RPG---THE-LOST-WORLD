import { criarEstadoBatalha, executarAcaoJogador } from "@engine/combate/index.js";
import { montarTelaBatalha, atualizarBarras, atualizarBotaoItem, registrarNoLog, mostrarOverlayFim } from "./telaBatalha.js";
import { reproduzirEventos } from "./animacoes.js";
import { renderizarIconesStatus } from "./iconesStatus.js";
import { checarLevelUp } from "@engine/personagem/experiencia.js";

const PAUSA_OVERLAY_FIM_MS = 1500;
const espera = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function descreverEvento(evento) {
  switch (evento.tipo) {
    case "dano":
      return evento.critico
        ? `Golpe crítico! Causou ${evento.valor} de dano.`
        : `${evento.autor === "jogador" ? "Você causou" : "O inimigo causou"} ${evento.valor} de dano.`;
    case "esquiva":
      return evento.autor === "inimigo"
        ? "O inimigo esquivou do seu ataque!"
        : "Você esquivou do ataque!";
    case "bloqueio":
      return "Você bloqueou o ataque!";
    case "sangramento_tick":
      return `O inimigo sangra e perde ${evento.dano} HP.`;
    case "envenenamento_tick":
      return `Você sofre ${evento.dano} de dano por veneno.`;
    case "sangramento_aplicado":
      return "Seu ataque causou sangramento no inimigo!";
    case "envenenamento_aplicado":
      return "O ataque do inimigo te envenenou!";
    case "cura_xama":
      return evento.valor > 0 ? `Sua conexão Xamã restaurou ${evento.valor} HP!` : null;
    case "pocao_usada":
      return `🧪 Você bebeu uma Poção de Cura e recuperou ${evento.valor} HP!`;
    case "pocao_indisponivel":
      return "Você não tem nenhuma Poção de Cura!";
    case "defendendo":
      return "Você se põe em guarda — o próximo golpe causará metade do dano.";
    case "fuga":
      return evento.sucesso ? "Você fugiu com sucesso!" : "A fuga falhou!";
    case "vitoria":
      return `Vitória! +${evento.xpGanho} XP, +${evento.ouroGanho} ouro.`;
    case "derrota":
      return "Você foi derrotado...";
    default:
      return null;
  }
}

export function iniciarBatalha(container, jogador, inimigoOriginal, { onFim, local } = {}) {
  let estado = criarEstadoBatalha(jogador, inimigoOriginal);
  const elementos = montarTelaBatalha(container, {
    jogador: estado.jogador,
    inimigo: estado.inimigo,
    local,
  });

  let processando = false;

  async function executar(acao) {
    if (processando || estado.fim) return;
    processando = true;
    elementos.botaoAtacar.disabled = true;
    elementos.botaoItem.disabled = true;
    elementos.botaoDefender.disabled = true;
    elementos.botaoFugir.disabled = true;

    const resultado = executarAcaoJogador(estado, acao);
    estado = { ...resultado.estado, fim: resultado.fim };

    await reproduzirEventos(resultado.eventos, elementos);
    atualizarBarras(elementos, estado.jogador, estado.inimigo);
    renderizarIconesStatus(elementos.iconesStatusJogador, estado.jogador);
    renderizarIconesStatus(elementos.iconesStatusInimigo, estado.inimigo);

    for (const evento of resultado.eventos) {
      const mensagem = descreverEvento(evento);
      if (mensagem) registrarNoLog(elementos, mensagem);
    }

    processando = false;
    if (!resultado.fim) {
      elementos.botaoAtacar.disabled = false;
      atualizarBotaoItem(elementos, estado.jogador);
      elementos.botaoDefender.disabled = false;
      elementos.botaoFugir.disabled = false;
    } else {
      if (resultado.fim === "vitoria" || resultado.fim === "derrota") {
        const eventoVitoria = resultado.eventos.find((e) => e.tipo === "vitoria");
        const eventosLevelUp = resultado.fim === "vitoria" ? checarLevelUp(estado.jogador) : [];
        mostrarOverlayFim(elementos, {
          tipo: resultado.fim,
          xpGanho: eventoVitoria?.xpGanho,
          ouroGanho: eventoVitoria?.ouroGanho,
          eventosLevelUp,
        });
        // Sem essa pausa, onFim() troca de tela (roteador limpa o container)
        // antes do navegador sequer pintar o overlay — ele nunca chega a ser
        // visto de fato (achado na verificação manual da Fase 5, não coberto
        // pelos testes unitários porque eles checam a classe CSS de forma
        // síncrona, sem esperar a troca de tela real acontecer).
        await espera(PAUSA_OVERLAY_FIM_MS);
      }
      if (onFim) onFim(resultado.fim, estado);
    }
  }

  elementos.botaoAtacar.addEventListener("click", () => executar("atacar"));
  elementos.botaoItem.addEventListener("click", () => executar("usar_pocao"));
  elementos.botaoDefender.addEventListener("click", () => executar("defender"));
  elementos.botaoFugir.addEventListener("click", () => executar("fugir"));

  return { ...elementos, executarAcao: executar };
}
