import { describe, it, expect, beforeEach } from "vitest";
import { bootstrap } from "./main.js";

beforeEach(() => {
  localStorage.clear();
});

describe("bootstrap", () => {
  it("mostra a tela de criação quando não há save", () => {
    const container = document.createElement("div");
    bootstrap(container);
    expect(container.querySelector(".tela-criacao")).not.toBeNull();
  });

  it("cria personagem, salva, e mostra a cidade", () => {
    const container = document.createElement("div");
    bootstrap(container);

    container.querySelector('[data-raca="Humano"]').click();
    container.querySelector('[data-classe="Paladino"]').click();
    const campoNome = container.querySelector("#campo-nome");
    campoNome.value = "Arthas";
    campoNome.dispatchEvent(new Event("input"));
    container.querySelector("#botao-confirmar").click();

    expect(container.querySelector(".tela-cidade")).not.toBeNull();
    expect(container.querySelector(".cabecalho-cidade").textContent).toContain("Arthas");
    expect(localStorage.getItem("webrpg_save")).not.toBeNull();
  });

  it('simula um "reload" (segunda chamada de bootstrap) continuando do save existente', () => {
    const primeiroContainer = document.createElement("div");
    bootstrap(primeiroContainer);
    primeiroContainer.querySelector('[data-raca="Elfo"]').click();
    primeiroContainer.querySelector('[data-classe="Xamã"]').click();
    const campoNome = primeiroContainer.querySelector("#campo-nome");
    campoNome.value = "Aelindra";
    campoNome.dispatchEvent(new Event("input"));
    primeiroContainer.querySelector("#botao-confirmar").click();

    // "Recarregar a página": novo container, bootstrap chamado de novo, mesmo localStorage
    const segundoContainer = document.createElement("div");
    bootstrap(segundoContainer);

    expect(segundoContainer.querySelector(".tela-cidade")).not.toBeNull();
    expect(segundoContainer.querySelector(".cabecalho-cidade").textContent).toContain("Aelindra");
  });
});

describe("bootstrap: navegação para guilda, loja e personagem", () => {
  function criarPersonagemDeTeste(container) {
    container.querySelector('[data-raca="Humano"]').click();
    container.querySelector('[data-classe="Paladino"]').click();
    const campoNome = container.querySelector("#campo-nome");
    campoNome.value = "Arthas";
    campoNome.dispatchEvent(new Event("input"));
    container.querySelector("#botao-confirmar").click();
  }

  it("abre a tela de loja a partir da cidade e volta ao sair", () => {
    const container = document.createElement("div");
    bootstrap(container);
    criarPersonagemDeTeste(container);

    container.querySelector('[data-local="loja"]').click();
    expect(container.querySelector(".tela-loja")).not.toBeNull();

    container.querySelector("#botao-sair-loja").click();
    expect(container.querySelector(".tela-cidade")).not.toBeNull();
  });

  it("abre a tela de personagem a partir da cidade", () => {
    const container = document.createElement("div");
    bootstrap(container);
    criarPersonagemDeTeste(container);

    container.querySelector('[data-local="personagem"]').click();
    expect(container.querySelector(".tela-personagem")).not.toBeNull();
  });

  it("abre a tela de guilda a partir da cidade", () => {
    const container = document.createElement("div");
    bootstrap(container);
    criarPersonagemDeTeste(container);

    container.querySelector('[data-local="guilda"]').click();
    expect(container.querySelector(".tela-guilda")).not.toBeNull();
  });
});
