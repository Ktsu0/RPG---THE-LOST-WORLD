import { describe, it, expect } from "vitest";
import { criarSave, serializarSave, desserializarSave } from "./index.js";

function jogadorDeTeste() {
  return { nome: "Thorin", nivel: 3, hp: 80, hpMax: 100 };
}

describe("criarSave", () => {
  it("envolve o jogador num objeto versionado", () => {
    expect(criarSave(jogadorDeTeste())).toEqual({ versao: 1, jogador: jogadorDeTeste() });
  });
});

describe("serializarSave e desserializarSave", () => {
  it("faz o round-trip preservando o jogador", () => {
    const texto = serializarSave(jogadorDeTeste());
    const resultado = desserializarSave(texto);
    expect(resultado).toEqual({ valido: true, jogador: jogadorDeTeste(), erro: null });
  });

  it("retorna inválido para um texto que não é JSON", () => {
    const resultado = desserializarSave("{ isso não é json");
    expect(resultado.valido).toBe(false);
    expect(resultado.jogador).toBeNull();
    expect(resultado.erro).toBe("Save corrompido (JSON inválido).");
  });

  it("retorna inválido quando falta o campo jogador", () => {
    const resultado = desserializarSave(JSON.stringify({ versao: 1 }));
    expect(resultado.valido).toBe(false);
    expect(resultado.erro).toBe("Formato de save inválido.");
  });

  it("retorna inválido quando a versão não bate", () => {
    const resultado = desserializarSave(JSON.stringify({ versao: 99, jogador: jogadorDeTeste() }));
    expect(resultado.valido).toBe(false);
    expect(resultado.erro).toBe("Versão de save incompatível (esperado 1, recebido 99).");
  });
});
