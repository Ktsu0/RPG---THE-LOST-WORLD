import { describe, it, expect, vi, afterEach } from "vitest";
import { rand } from "./aleatorio.js";

describe("rand", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna o valor mínimo quando Math.random retorna 0", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(rand(5, 10)).toBe(5);
  });

  it("retorna o valor máximo quando Math.random se aproxima de 1", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    expect(rand(5, 10)).toBe(10);
  });

  it("calcula um valor intermediário corretamente", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(rand(1, 100)).toBe(51);
  });
});
