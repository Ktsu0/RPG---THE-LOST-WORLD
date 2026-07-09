function criarCombatente(nome, classeSprite) {
  const wrapper = document.createElement("div");
  wrapper.className = "combatente";
  wrapper.innerHTML = `
    <div class="sprite" data-personagem="${classeSprite}"></div>
    <div class="painel-status">
      <strong class="nome-combatente">${nome}</strong>
      <div class="barra"><div class="barra__preenchimento barra__preenchimento--hp"></div></div>
    </div>
  `;
  return wrapper;
}

export function montarTelaBatalha(container, { jogador, inimigo }) {
  container.innerHTML = `
    <div class="tela-batalha">
      <div class="palco-batalha"></div>
      <div class="painel log-batalha" aria-live="polite"></div>
      <div class="barra-acoes">
        <button class="botao botao--destaque" data-acao="atacar">Atacar</button>
        <button class="botao" data-acao="fugir">Fugir</button>
      </div>
    </div>
  `;

  const palco = container.querySelector(".palco-batalha");
  const combatenteJogador = criarCombatente(jogador.nome || "Você", "soldado");
  const combatenteInimigo = criarCombatente(inimigo.nome, "orc");
  palco.appendChild(combatenteJogador);
  palco.appendChild(combatenteInimigo);

  const elementos = {
    palco,
    combatenteJogador,
    combatenteInimigo,
    spriteJogador: combatenteJogador.querySelector(".sprite"),
    spriteInimigo: combatenteInimigo.querySelector(".sprite"),
    barraHpJogador: combatenteJogador.querySelector(".barra__preenchimento--hp"),
    barraHpInimigo: combatenteInimigo.querySelector(".barra__preenchimento--hp"),
    log: container.querySelector(".log-batalha"),
    botaoAtacar: container.querySelector('[data-acao="atacar"]'),
    botaoFugir: container.querySelector('[data-acao="fugir"]'),
  };

  atualizarBarras(elementos, jogador, inimigo);
  return elementos;
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
