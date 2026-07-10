import { describe, it, expect, vi } from "vitest";
import { montarTelaCriacao } from "./telaCriacao.js";

describe("montarTelaCriacao", () => {
  it("renderiza um botão para cada raça e cada classe", () => {
    const container = document.createElement("div");
    montarTelaCriacao(container, { aoConfirmar: vi.fn() });
    expect(container.querySelectorAll('[data-raca]')).toHaveLength(7);
    expect(container.querySelectorAll('[data-classe]')).toHaveLength(6);
  });

  it("o botão confirmar começa desabilitado", () => {
    const container = document.createElement("div");
    const elementos = montarTelaCriacao(container, { aoConfirmar: vi.fn() });
    expect(elementos.botaoConfirmar.disabled).toBe(true);
  });

  it("atualiza o preview de atributos ao escolher raça e classe", () => {
    const container = document.createElement("div");
    const elementos = montarTelaCriacao(container, { aoConfirmar: vi.fn() });

    container.querySelector('[data-raca="Anão"]').click();
    container.querySelector('[data-classe="Arqueiro"]').click();

    // hp = 100, ataque = 5 + (-3) + 0 = 2, defesa = 5 + 15 + 0 = 20
    expect(elementos.painelPreview.textContent).toContain("HP: 100");
    expect(elementos.painelPreview.textContent).toContain("Ataque: 2");
    expect(elementos.painelPreview.textContent).toContain("Defesa: 20");
  });

  it("habilita o botão confirmar somente quando raça, classe e nome estão preenchidos", () => {
    const container = document.createElement("div");
    const elementos = montarTelaCriacao(container, { aoConfirmar: vi.fn() });

    container.querySelector('[data-raca="Humano"]').click();
    expect(elementos.botaoConfirmar.disabled).toBe(true);

    container.querySelector('[data-classe="Paladino"]').click();
    expect(elementos.botaoConfirmar.disabled).toBe(true);

    elementos.campoNome.value = "Arthas";
    elementos.campoNome.dispatchEvent(new Event("input"));
    expect(elementos.botaoConfirmar.disabled).toBe(false);
  });

  it("chama aoConfirmar com o jogador criado ao clicar em confirmar", () => {
    const aoConfirmar = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaCriacao(container, { aoConfirmar });

    container.querySelector('[data-raca="Elfo"]').click();
    container.querySelector('[data-classe="Xamã"]').click();
    elementos.campoNome.value = "Aelindra";
    elementos.campoNome.dispatchEvent(new Event("input"));
    elementos.botaoConfirmar.click();

    expect(aoConfirmar).toHaveBeenCalledOnce();
    const jogadorCriado = aoConfirmar.mock.calls[0][0];
    expect(jogadorCriado.nome).toBe("Aelindra");
    expect(jogadorCriado.raca).toBe("Elfo");
    expect(jogadorCriado.classe).toBe("Xamã");
  });
});
