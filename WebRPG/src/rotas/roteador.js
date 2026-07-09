const telas = new Map();
let telaAtual = null;
let elementoContainer = null;

export function inicializarRoteador(container) {
  elementoContainer = container;
  telas.clear();
  telaAtual = null;
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
  const montar = telas.get(nome);
  montar(elementoContainer, props);
  telaAtual = nome;
}

export function telaAtualNome() {
  return telaAtual;
}
