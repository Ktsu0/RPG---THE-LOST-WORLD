import { describe, it, expect } from "vitest";
import { renderizarIconesStatus } from "./iconesStatus.js";

describe("renderizarIconesStatus", () => {
  it("renderiza um ícone por efeito ativo, com tooltip de nome/efeito/turnos", () => {
    const el = document.createElement("div");
    renderizarIconesStatus(el, { status: [{ tipo: "envenenamento", duracao: 2 }, { tipo: "paralisado", duracao: 1 }] });
    const icones = el.querySelectorAll(".icone-status");
    expect(icones).toHaveLength(2);
    expect(icones[0].title).toContain("Envenenado");
    expect(icones[0].title).toContain("2 turno");
  });

  it("limpa os ícones anteriores a cada re-render", () => {
    const el = document.createElement("div");
    renderizarIconesStatus(el, { status: [{ tipo: "envenenamento", duracao: 2 }] });
    renderizarIconesStatus(el, { status: [] });
    expect(el.querySelectorAll(".icone-status")).toHaveLength(0);
  });

  it("um tipo desconhecido ganha o ícone genérico em vez de quebrar", () => {
    const el = document.createElement("div");
    renderizarIconesStatus(el, { status: [{ tipo: "efeito_de_fase_futura", duracao: 3 }] });
    expect(el.querySelectorAll(".icone-status")).toHaveLength(1);
  });
});
