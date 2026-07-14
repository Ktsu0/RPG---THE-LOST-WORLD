import { describe, it, expect, beforeEach } from "vitest";
import {
  inicializarRoteador,
  registrarTela,
  mostrarTela,
  telaAtualNome,
  telaAtualInstancia,
} from "./roteador.js";

describe("roteador", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    inicializarRoteador(container);
  });

  it("lança erro ao mostrar uma tela não registrada", () => {
    expect(() => mostrarTela("inexistente")).toThrow(
      'Tela "inexistente" não foi registrada.'
    );
  });

  it("monta a tela registrada dentro do container", () => {
    registrarTela("titulo", (el) => {
      el.innerHTML = "<h1>THE LOST WORLD</h1>";
    });
    mostrarTela("titulo");
    expect(container.querySelector("h1").textContent).toBe("THE LOST WORLD");
  });

  it("limpa o conteúdo anterior ao trocar de tela", () => {
    registrarTela("a", (el) => {
      el.innerHTML = "<p>A</p>";
    });
    registrarTela("b", (el) => {
      el.innerHTML = "<p>B</p>";
    });
    mostrarTela("a");
    mostrarTela("b");
    expect(container.querySelectorAll("p").length).toBe(1);
    expect(container.querySelector("p").textContent).toBe("B");
  });

  it("passa props para a função de montagem", () => {
    let recebido = null;
    registrarTela("com-props", (el, props) => {
      recebido = props;
    });
    mostrarTela("com-props", { valor: 42 });
    expect(recebido).toEqual({ valor: 42 });
  });

  it("rastreia o nome da tela atual", () => {
    registrarTela("titulo", () => {});
    mostrarTela("titulo");
    expect(telaAtualNome()).toBe("titulo");
  });

  it("guarda o que a função de montagem retornou", () => {
    registrarTela("titulo", () => ({ marcador: 42 }));
    mostrarTela("titulo");
    expect(telaAtualInstancia()).toEqual({ marcador: 42 });
  });

  describe("transição de fade", () => {
    it("aplica e remove a classe tela--entrando na tela recém-montada", async () => {
      registrarTela("a", (el) => { el.innerHTML = "<p>A</p>"; });
      await mostrarTela("a");
      // logo após montar, a classe de entrada é removida no próximo frame (via rAF/microtask)
      await new Promise((resolve) => requestAnimationFrame(resolve));
      expect(container.querySelector("p").parentElement.classList.contains("tela--entrando")).toBe(false);
    });
  });
});
