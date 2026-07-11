export function montarTelaTitulo(container, { aoNovaJornada, aoContinuar, temSave }) {
  container.innerHTML = `
    <div class="tela-titulo">
      <h1 class="logo-titulo">THE LOST WORLD</h1>
      <div class="menu-titulo">
        <button class="botao botao--destaque" id="botao-nova-jornada">Nova Jornada</button>
        <button class="botao" id="botao-continuar" ${temSave ? "" : "disabled"}>Continuar</button>
      </div>
    </div>
  `;

  container.querySelector("#botao-nova-jornada").addEventListener("click", () => aoNovaJornada());

  const botaoContinuar = container.querySelector("#botao-continuar");
  if (temSave) {
    botaoContinuar.addEventListener("click", () => aoContinuar());
  }

  return {
    botaoNovaJornada: container.querySelector("#botao-nova-jornada"),
    botaoContinuar,
  };
}
