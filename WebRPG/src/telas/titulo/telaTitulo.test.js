import { describe, it, expect, vi } from "vitest";
import { montarTelaTitulo } from "./telaTitulo.js";

describe("montarTelaTitulo", () => {
  it("mostra o logo do jogo", () => {
    const container = document.createElement("div");
    montarTelaTitulo(container, { aoNovaJornada: vi.fn(), aoContinuar: vi.fn(), temSave: false });
    expect(container.querySelector(".logo-titulo").textContent).toContain("THE LOST WORLD");
  });

  it("desabilita Continuar quando não há save", () => {
    const container = document.createElement("div");
    montarTelaTitulo(container, { aoNovaJornada: vi.fn(), aoContinuar: vi.fn(), temSave: false });
    expect(container.querySelector("#botao-continuar").disabled).toBe(true);
  });

  it("habilita Continuar e chama aoContinuar quando há save", () => {
    const aoContinuar = vi.fn();
    const container = document.createElement("div");
    montarTelaTitulo(container, { aoNovaJornada: vi.fn(), aoContinuar, temSave: true });
    const botao = container.querySelector("#botao-continuar");
    expect(botao.disabled).toBe(false);
    botao.click();
    expect(aoContinuar).toHaveBeenCalledOnce();
  });

  it("chama aoNovaJornada ao clicar em Nova Jornada", () => {
    const aoNovaJornada = vi.fn();
    const container = document.createElement("div");
    montarTelaTitulo(container, { aoNovaJornada, aoContinuar: vi.fn(), temSave: false });
    container.querySelector("#botao-nova-jornada").click();
    expect(aoNovaJornada).toHaveBeenCalledOnce();
  });

  it("modoSaveCorrompido mostra o aviso e o botão de importar backup", () => {
    const container = document.createElement("div");
    montarTelaTitulo(container, {
      aoNovaJornada: vi.fn(), aoContinuar: vi.fn(), temSave: false,
      modoSaveCorrompido: true, aoImportar: vi.fn(),
    });
    expect(container.querySelector(".aviso-save-corrompido")).not.toBeNull();
    expect(container.querySelector("#input-importar-titulo")).not.toBeNull();
  });

  it("sem modoSaveCorrompido não mostra o aviso nem o botão de importar", () => {
    const container = document.createElement("div");
    montarTelaTitulo(container, { aoNovaJornada: vi.fn(), aoContinuar: vi.fn(), temSave: false });
    expect(container.querySelector(".aviso-save-corrompido")).toBeNull();
    expect(container.querySelector("#input-importar-titulo")).toBeNull();
  });
});
