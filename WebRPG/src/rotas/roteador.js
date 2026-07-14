const telas = new Map();
let telaAtual = null;
let instanciaAtual = null;
let elementoContainer = null;

export function inicializarRoteador(container) {
  elementoContainer = container;
  telas.clear();
  telaAtual = null;
  instanciaAtual = null;
}

export function registrarTela(nome, montar) {
  telas.set(nome, montar);
}

export function mostrarTela(nome, props = {}) {
  if (!telas.has(nome)) {
    throw new Error(`Tela "${nome}" não foi registrada.`);
  }
  if (!elementoContainer) {
    throw new Error(
      "Roteador não foi inicializado. Chame inicializarRoteador primeiro."
    );
  }

  elementoContainer.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = "tela-wrapper tela--entrando";
  elementoContainer.appendChild(wrapper);

  const montar = telas.get(nome);
  instanciaAtual = montar(wrapper, props);
  telaAtual = nome;

  requestAnimationFrame(() => {
    wrapper.classList.remove("tela--entrando");
  });
}

export function telaAtualNome() {
  return telaAtual;
}

// O que a função de montagem da tela atual retornou (ex.: os elementos/handles
// que WebRPG/src/telas/*/telaX.js expõe) — usado em testes para acionar
// comportamento de telas que renderizam em canvas (Phaser) e não são
// alcançáveis por querySelector sob jsdom. Ver WebRPG/src/main.test.js.
export function telaAtualInstancia() {
  return instanciaAtual;
}
