import { describe, it, expect } from "vitest";
import { montarTelaInicial } from "./inicial.js";

describe("tela inicial", () => {
  it("renderiza o título do jogo", () => {
    const container = document.createElement("div");
    montarTelaInicial(container);
    expect(container.querySelector("h1").textContent).toBe("THE LOST WORLD");
  });
});
