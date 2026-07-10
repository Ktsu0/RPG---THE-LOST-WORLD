import { describe, it, expect, vi, afterEach } from "vitest";
import {
  salvarNoNavegador,
  carregarDoNavegador,
  existeSaveNoNavegador,
  exportarSave,
  importarSave,
} from "./localStorage.js";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

function jogadorDeTeste() {
  return { nome: "Testudo", hp: 10 };
}

describe("salvarNoNavegador e carregarDoNavegador", () => {
  it("retorna inválido (sem erro) quando não há save salvo", () => {
    expect(carregarDoNavegador()).toEqual({ valido: false, jogador: null, erro: null });
  });

  it("salva e recupera o jogador corretamente", () => {
    salvarNoNavegador(jogadorDeTeste());
    expect(carregarDoNavegador()).toEqual({ valido: true, jogador: jogadorDeTeste(), erro: null });
  });
});

describe("existeSaveNoNavegador", () => {
  it("retorna false antes de salvar e true depois", () => {
    expect(existeSaveNoNavegador()).toBe(false);
    salvarNoNavegador(jogadorDeTeste());
    expect(existeSaveNoNavegador()).toBe(true);
  });
});

describe("importarSave", () => {
  it("aceita um texto de save válido", () => {
    const texto = JSON.stringify({ versao: 1, jogador: jogadorDeTeste() });
    expect(importarSave(texto)).toEqual({ valido: true, jogador: jogadorDeTeste(), erro: null });
  });

  it("rejeita um texto corrompido", () => {
    const resultado = importarSave("{ isso não é json");
    expect(resultado.valido).toBe(false);
  });
});

describe("exportarSave", () => {
  it("cria uma URL de blob e dispara o download via link", () => {
    const criarObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    const revogarObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const clique = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    exportarSave(jogadorDeTeste());

    expect(criarObjectURL).toHaveBeenCalledOnce();
    expect(clique).toHaveBeenCalledOnce();
    expect(revogarObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});
