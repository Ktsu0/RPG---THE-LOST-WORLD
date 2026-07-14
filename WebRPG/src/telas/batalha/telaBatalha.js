import { spriteParaInimigo } from "./mapaSprites.js";
import { contarPocoes } from "@engine/itens/pocao.js";

function criarCombatente(nome, classeSprite) {
  const wrapper = document.createElement("div");
  wrapper.className = "combatente";
  wrapper.innerHTML = `
    <div class="sprite" data-personagem="${classeSprite}"></div>
    <div class="painel-status">
      <strong class="nome-combatente">${nome}</strong>
      <div class="barra"><div class="barra__preenchimento barra__preenchimento--hp"></div></div>
      <div class="icones-status"></div>
    </div>
  `;
  return wrapper;
}

export function montarTelaBatalha(container, { jogador, inimigo, local = "treino" }) {
  container.innerHTML = `
    <div class="tela-batalha">
      <div class="palco-batalha palco-batalha--${local}"></div>
      <div class="painel log-batalha" aria-live="polite"></div>
      <div class="barra-acoes">
        <button class="botao botao--destaque" data-acao="atacar">Atacar</button>
        <button class="botao" data-acao="usar_pocao">🧪 Poção (0)</button>
        <button class="botao" data-acao="defender">Defender</button>
        <button class="botao" data-acao="fugir">Fugir</button>
      </div>
      <div class="overlay-fim overlay-fim--oculto"></div>
    </div>
  `;

  const palco = container.querySelector(".palco-batalha");
  const personagemInimigo = spriteParaInimigo(inimigo.nome);
  const combatenteJogador = criarCombatente(jogador.nome || "Você", "soldado");
  const combatenteInimigo = criarCombatente(inimigo.nome, personagemInimigo);
  palco.appendChild(combatenteJogador);
  palco.appendChild(combatenteInimigo);

  const elementos = {
    palco,
    combatenteJogador,
    combatenteInimigo,
    personagemJogador: "soldado",
    personagemInimigo,
    spriteJogador: combatenteJogador.querySelector(".sprite"),
    spriteInimigo: combatenteInimigo.querySelector(".sprite"),
    barraHpJogador: combatenteJogador.querySelector(".barra__preenchimento--hp"),
    barraHpInimigo: combatenteInimigo.querySelector(".barra__preenchimento--hp"),
    iconesStatusJogador: combatenteJogador.querySelector(".icones-status"),
    iconesStatusInimigo: combatenteInimigo.querySelector(".icones-status"),
    log: container.querySelector(".log-batalha"),
    botaoAtacar: container.querySelector('[data-acao="atacar"]'),
    botaoItem: container.querySelector('[data-acao="usar_pocao"]'),
    botaoDefender: container.querySelector('[data-acao="defender"]'),
    botaoFugir: container.querySelector('[data-acao="fugir"]'),
    overlayFim: container.querySelector(".overlay-fim"),
  };

  atualizarBarras(elementos, jogador, inimigo);
  atualizarBotaoItem(elementos, jogador);
  return elementos;
}

export function atualizarBotaoItem(elementos, jogador) {
  const quantidade = contarPocoes(jogador);
  elementos.botaoItem.textContent = `🧪 Poção (${quantidade})`;
  elementos.botaoItem.disabled = quantidade === 0;
}

export function atualizarBarras(elementos, jogador, inimigo) {
  const percentualJogador = Math.max(0, Math.min(100, (jogador.hp / jogador.hpMax) * 100));
  const percentualInimigo = Math.max(0, Math.min(100, (inimigo.hp / inimigo.hpMax) * 100));
  elementos.barraHpJogador.style.width = `${percentualJogador}%`;
  elementos.barraHpInimigo.style.width = `${percentualInimigo}%`;
}

export function registrarNoLog(elementos, mensagem) {
  const linha = document.createElement("p");
  linha.textContent = mensagem;
  elementos.log.appendChild(linha);
  elementos.log.scrollTop = elementos.log.scrollHeight;
}

export function mostrarOverlayFim(elementos, { tipo, xpGanho, ouroGanho }) {
  const titulo = tipo === "vitoria" ? "Vitória!" : "Derrota...";
  const detalhe = tipo === "vitoria" ? `+${xpGanho} XP, +${ouroGanho} ouro` : "Tente novamente.";
  elementos.overlayFim.innerHTML = `
    <h1 class="texto-pixel">${titulo}</h1>
    <p>${detalhe}</p>
  `;
  elementos.overlayFim.classList.remove("overlay-fim--oculto");
}
