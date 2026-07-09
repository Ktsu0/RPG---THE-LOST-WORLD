import { describe, it, expect } from "vitest";
import { definirSprite, tocarAnimacao } from "./sprites.js";

describe("definirSprite", () => {
  it("define a imagem de fundo e as variáveis CSS de acordo com a animação", () => {
    const elemento = document.createElement("div");
    definirSprite(elemento, "soldado", "ataque");
    expect(elemento.style.backgroundImage).toBe(
      'url("/assets/personagens/soldado/ataque.png")'
    );
    expect(elemento.style.getPropertyValue("--sprite-frames")).toBe("6");
    expect(elemento.style.getPropertyValue("--sprite-duration")).toBe("0.6s");
  });

  it("lança erro para uma animação desconhecida", () => {
    const elemento = document.createElement("div");
    expect(() => definirSprite(elemento, "soldado", "voar")).toThrow(
      'Animação "voar" não existe.'
    );
  });
});

describe("tocarAnimacao", () => {
  it("resolve imediatamente para animações em loop (idle)", async () => {
    const elemento = document.createElement("div");
    await expect(tocarAnimacao(elemento, "soldado", "idle")).resolves.toBeUndefined();
  });

  it("aguarda o evento animationend para animações de disparo único", async () => {
    const elemento = document.createElement("div");
    const promessa = tocarAnimacao(elemento, "soldado", "ataque");
    elemento.dispatchEvent(new Event("animationend"));
    await expect(promessa).resolves.toBeUndefined();
  });
});
