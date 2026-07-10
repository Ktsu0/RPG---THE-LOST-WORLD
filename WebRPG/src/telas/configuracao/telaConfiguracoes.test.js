import { describe, it, expect, vi, beforeEach } from "vitest";
import { montarTelaConfiguracoes } from "./telaConfiguracoes.js";

beforeEach(() => {
  localStorage.clear();
});

function jogadorDeTeste() {
  return { nome: "Thorin" };
}

describe("montarTelaConfiguracoes", () => {
  it("mostra os sliders de volume com os valores atuais", () => {
    const container = document.createElement("div");
    montarTelaConfiguracoes(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    expect(container.querySelector('[data-volume="efeitos"]').value).toBe("0.6");
    expect(container.querySelector('[data-volume="musica"]').value).toBe("0.4");
  });

  it("atualiza o volume de efeitos ao mover o slider", () => {
    const container = document.createElement("div");
    montarTelaConfiguracoes(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    const slider = container.querySelector('[data-volume="efeitos"]');
    slider.value = "0.1";
    slider.dispatchEvent(new Event("input"));
    expect(localStorage.getItem("webrpg_volume_efeitos")).toBe("0.1");
  });

  it("exportarSave é acionado ao clicar em Exportar Save", () => {
    const cliqueMock = vi.fn();
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(cliqueMock);

    const container = document.createElement("div");
    montarTelaConfiguracoes(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    container.querySelector("#botao-exportar-save").click();

    expect(cliqueMock).toHaveBeenCalledOnce();
  });

  it("chama aoSair ao clicar em Voltar", () => {
    const aoSair = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaConfiguracoes(container, { jogador: jogadorDeTeste(), aoSair });
    elementos.botaoSair.click();
    expect(aoSair).toHaveBeenCalledOnce();
  });
});
