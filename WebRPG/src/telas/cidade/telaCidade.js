export function montarTelaCidade(container, { jogador, aoExplorar }) {
  container.innerHTML = `
    <div class="tela-cidade">
      <div class="painel cabecalho-cidade">
        <strong>${jogador.nome}</strong>
        <span>Nível ${jogador.nivel}</span>
        <span>HP: ${jogador.hp}/${jogador.hpMax}</span>
        <span>Ouro: ${jogador.ouro}</span>
      </div>
      <div class="grade-locais">
        <button class="botao botao--destaque local-cidade" data-local="explorar">🌳 Explorar</button>
        <button class="botao local-cidade" data-local="guilda" disabled>📝 Guilda — Em breve</button>
        <button class="botao local-cidade" data-local="loja" disabled>💰 Loja — Em breve</button>
        <button class="botao local-cidade" data-local="torre" disabled>🏰 Torre — Em breve</button>
        <button class="botao local-cidade" data-local="masmorra" disabled>🗝️ Masmorra — Em breve</button>
        <button class="botao local-cidade" data-local="arena" disabled>⚔️ Arena — Em breve</button>
      </div>
    </div>
  `;

  const botaoExplorar = container.querySelector('[data-local="explorar"]');
  botaoExplorar.addEventListener("click", () => aoExplorar());

  return { botaoExplorar, cabecalho: container.querySelector(".cabecalho-cidade") };
}
