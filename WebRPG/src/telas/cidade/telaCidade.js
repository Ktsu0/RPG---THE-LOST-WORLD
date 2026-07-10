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
      <div class="grade-locais">
        <button class="botao botao--destaque local-cidade" data-local="explorar">🌳 Explorar</button>
        <button class="botao local-cidade" data-local="guilda">📝 Guilda</button>
        <button class="botao local-cidade" data-local="loja">💰 Loja</button>
        <button class="botao local-cidade" data-local="personagem">🧑 Personagem</button>
        <button class="botao local-cidade" data-local="torre">🏰 Torre</button>
        <button class="botao local-cidade" data-local="masmorra">🗝️ Masmorra</button>
        <button class="botao local-cidade" data-local="arena">⚔️ Arena</button>
        <button class="botao local-cidade" data-local="configuracao">⚙️ Configurações</button>
      </div>
    </div>
  `;

  const botaoExplorar = container.querySelector('[data-local="explorar"]');
  botaoExplorar.addEventListener("click", () => aoExplorar());

  container.querySelector('[data-local="guilda"]').addEventListener("click", () => aoAbrirGuilda());
  container.querySelector('[data-local="loja"]').addEventListener("click", () => aoAbrirLoja());
  container.querySelector('[data-local="personagem"]').addEventListener("click", () => aoAbrirPersonagem());
  container.querySelector('[data-local="torre"]').addEventListener("click", () => aoAbrirTorre());
  container.querySelector('[data-local="masmorra"]').addEventListener("click", () => aoAbrirMasmorra());
  container.querySelector('[data-local="arena"]').addEventListener("click", () => aoAbrirArena());
  container.querySelector('[data-local="configuracao"]').addEventListener("click", () => aoAbrirConfiguracao());

  return { botaoExplorar, cabecalho: container.querySelector(".cabecalho-cidade") };
}
