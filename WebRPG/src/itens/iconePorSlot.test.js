import { describe, it, expect } from "vitest";
import { iconePorSlot } from "./iconePorSlot.js";

describe("iconePorSlot", () => {
  it.each([
    ["head", "head"],
    ["chest", "chest"],
    ["hands", "hands"],
    ["legs", "legs"],
    ["feet", "feet"],
    ["weapon", "weapon"],
    ["consumable", "consumable"],
  ])('mapeia o slot "%s" para o ícone "%s"', (slot, icone) => {
    expect(iconePorSlot(slot)).toBe(icone);
  });

  it("retorna o ícone genérico para um slot desconhecido", () => {
    expect(iconePorSlot("slot-nunca-visto")).toBe("generico");
  });
});
