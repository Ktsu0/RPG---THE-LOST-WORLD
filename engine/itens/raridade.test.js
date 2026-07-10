import { describe, it, expect } from "vitest";
import { obterClasseRaridade } from "./raridade.js";

describe("obterClasseRaridade", () => {
  it("mapeia comum, raro e lendario para suas classes CSS", () => {
    expect(obterClasseRaridade("comum")).toBe("raridade--comum");
    expect(obterClasseRaridade("raro")).toBe("raridade--raro");
    expect(obterClasseRaridade("lendario")).toBe("raridade--lendario");
  });

  it("retorna raridade--padrao para valores desconhecidos", () => {
    expect(obterClasseRaridade("epico")).toBe("raridade--padrao");
    expect(obterClasseRaridade(undefined)).toBe("raridade--padrao");
  });
});
